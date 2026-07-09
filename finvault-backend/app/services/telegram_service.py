import requests
import logging
import threading
import time
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal
from app.services.nlp_parser import parse_expense_text
from app.schemas.expense import ExpenseCreate

logger = logging.getLogger(__name__)

def send_telegram_notification(message: str) -> bool:
    """Sends a formatted HTML notification message to the user's Telegram chat."""
    bot_token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id
    
    if not bot_token or not chat_id:
        logger.warning("Telegram Bot Token or Chat ID not configured.")
        return False
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=8)
        if response.status_code == 200:
            logger.info("Telegram notification sent successfully.")
            return True
        else:
            logger.error(f"Failed to send Telegram message: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}")
    return False

def _process_updates(bot_token: str, chat_id: str):
    """Internal loop that polls for new messages and processes them."""
    offset = 0
    logger.info("Telegram listener thread started.")
    
    # Imports here to avoid circular imports on startup
    from app.services.expense_service import create_expense
    
    while True:
        try:
            url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
            params = {"offset": offset, "timeout": 15}
            response = requests.get(url, params=params, timeout=20)
            
            if response.status_code != 200:
                logger.error(f"Telegram polling error: {response.status_code} - {response.text}")
                time.sleep(5)
                continue
                
            data = response.json()
            if not data.get("ok"):
                logger.error(f"Telegram API ok=False in updates: {data}")
                time.sleep(5)
                continue
                
            results = data.get("result", [])
            for update in results:
                # Update offset to avoid reading this message again
                offset = update["update_id"] + 1
                
                message = update.get("message")
                if not message:
                    continue
                    
                sender = message.get("chat", {})
                sender_id = str(sender.get("id", ""))
                text = message.get("text", "").strip()
                
                # Check that this message is from the configured user
                if sender_id != str(chat_id):
                    logger.warning(f"Ignored Telegram message from unauthorized user ID: {sender_id}")
                    continue
                    
                if not text:
                    continue
                    
                # Handle special commands like /start or /help
                if text.startswith("/"):
                    if text.startswith("/start") or text.startswith("/help"):
                        help_msg = (
                            "👋 <b>Welcome to FinVault Expense Logger Bot!</b>\n\n"
                            "You can text me your daily expenses in plain English, and I will automatically parse and add them to your dashboard!\n\n"
                            "<b>Examples:</b>\n"
                            "• <i>spent 450 on food yesterday for burger</i>\n"
                            "• <i>₹500 travel cab ride today</i>\n"
                            "• <i>1200 shopping at Zara</i>\n\n"
                            "Send any message to try it out!"
                        )
                        send_telegram_notification(help_msg)
                    continue
                
                # Process plain text as an expense
                parsed = parse_expense_text(text)
                amount = parsed.get("amount", 0.0)
                
                if amount <= 0.0:
                    err_msg = (
                        f"⚠️ <b>Unable to Parse Amount</b>\n"
                        f"I couldn't detect a valid cost or amount in your message: <i>\"{text}\"</i>.\n"
                        f"Please specify a number (e.g. <code>₹500 for lunch</code>)."
                    )
                    send_telegram_notification(err_msg)
                    continue
                
                # Insert expense into database
                db = SessionLocal()
                try:
                    payload = ExpenseCreate(
                        amount=amount,
                        category=parsed.get("category", "Other"),
                        date=parsed.get("date"),
                        description=parsed.get("description", "Telegram Logged")
                    )
                    created = create_expense(db, payload)
                    
                    # Send confirmation back
                    success_msg = (
                        f"✅ <b>Expense Logged</b>\n"
                        f"━━━━━━━━━━━━━━━━━━━━━\n"
                        f"<b>Description:</b> {created.description}\n"
                        f"<b>Amount:</b> ₹{created.amount:,.2f}\n"
                        f"<b>Category:</b> {created.category}\n"
                        f"<b>Date:</b> {created.date}"
                    )
                    send_telegram_notification(success_msg)
                except Exception as db_err:
                    logger.error(f"Error saving Telegram-initiated expense: {db_err}")
                    send_telegram_notification("❌ An error occurred while saving the expense in the database.")
                finally:
                    db.close()
                    
        except Exception as e:
            logger.error(f"Unexpected error in Telegram polling loop: {e}")
            time.sleep(5)

def start_telegram_polling():
    """Launches the Telegram update listener in a background daemon thread."""
    bot_token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id
    
    if not bot_token or not chat_id:
        logger.warning("Telegram polling not started. Bot Token or Chat ID is missing.")
        return
        
    t = threading.Thread(target=_process_updates, args=(bot_token, chat_id), daemon=True)
    t.start()
    logger.info("Telegram background polling thread launched.")


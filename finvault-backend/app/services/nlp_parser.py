import re
from datetime import date, timedelta
from app.ml.categorizer import predict as predict_category

CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Housing", "Transport", "Subscriptions", "Income", "Other"]

def parse_expense_text(text: str) -> dict:
    """
    Parses a natural language English sentence to extract:
    - amount: float
    - date: YYYY-MM-DD
    - category: string
    - description: string
    """
    text_lower = text.lower()
    
    # 1. Parse Date
    target_date = date.today()
    if "yesterday" in text_lower:
        target_date = date.today() - timedelta(days=1)
    elif "day before yesterday" in text_lower:
        target_date = date.today() - timedelta(days=2)
    else:
        # Match explicit dates (e.g. YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
        iso_match = re.search(r'\b(\d{4})[-/](\d{2})[-/](\d{2})\b', text)
        if iso_match:
            target_date = date(int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3)))
        else:
            dmy_match = re.search(r'\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b', text)
            if dmy_match:
                target_date = date(int(dmy_match.group(3)), int(dmy_match.group(2)), int(dmy_match.group(1)))

    # 2. Parse Amount
    # Matches: ₹500, Rs 500, $500, 500.50, 500 rupees, etc.
    amount = 0.0
    # Pattern to find numbers near currency markers, or just general floating numbers
    currency_pattern = r'(?:rs\.?|inr|rupees|usd|\$|₹)\s*(\d+(?:\.\d+)?)|\b(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|rupees|usd|\$|₹)'
    cur_match = re.search(currency_pattern, text_lower)
    if cur_match:
        val = cur_match.group(1) or cur_match.group(2)
        amount = float(val)
    else:
        # General fallback: find all numbers that don't look like a date or year (e.g. 2026)
        all_numbers = re.findall(r'\b\d+(?:\.\d+)?\b', text)
        for num in all_numbers:
            # Skip numbers likely to be years (between 2020 and 2030) or small loop index
            val = float(num)
            if not (2020 <= val <= 2035):
                amount = val
                break

    # 3. Clean and Extract Description
    # Remove dates, amounts, and common trigger words
    clean_text = text
    # Remove amount and currency terms
    clean_text = re.sub(r'(?:rs\.?|inr|rupees|usd|\$|₹)\s*\d+(?:\.\d+)?|\b\d+(?:\.\d+)?\s*(?:rs\.?|inr|rupees|usd|\$|₹)?', '', clean_text, flags=re.IGNORECASE)
    # Remove date terms
    clean_text = re.sub(r'\b(today|yesterday|day before yesterday)\b', '', clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r'\b(\d{4})[-/](\d{2})[-/](\d{2})\b|\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b', '', clean_text)
    # Remove common action words
    clean_text = re.sub(r'\b(spent|spend|paid|pay|bought|buy|gave|give|for|on|at|to|a|an|the|of|in)\b', '', clean_text, flags=re.IGNORECASE)
    # Remove double spaces and strip
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    # Capitalize the merchant/description name nicely
    description = clean_text.title() if clean_text else "General Expense"

    # 4. Predict Category
    category = "Other"
    
    # Simple keyword heuristics as fallback or prior to ML
    category_map = {
        "Food": ["food", "lunch", "dinner", "breakfast", "swiggy", "zomato", "dosa", "pizza", "burger", "mcdonald", "starbucks", "grocery", "groceries", "restaurant", "cafe"],
        "Travel": ["travel", "flight", "uber", "ola", "cab", "auto", "rapido", "rapidpo", "taxi", "train", "metro", "bus", "hotel", "stay", "trip", "vacation"],
        "Bills": ["bill", "electricity", "water", "gas", "wifi", "internet", "recharge", "phone", "mobile", "rent"],
        "Shopping": ["shopping", "amazon", "flipkart", "clothes", "shoes", "myntra", "mall"],
        "Entertainment": ["entertainment", "movie", "netflix", "spotify", "prime", "game", "concert", "theatre", "show", "pub", "bar", "club", "party"]
    }
    
    found_keyword = False
    for cat, keywords in category_map.items():
        # Match keywords as word boundaries or exact substrings
        if any(re.search(rf'\b{re.escape(kw)}\b', text_lower) for kw in keywords):
            category = cat
            found_keyword = True
            break
            
    if not found_keyword:
        # Use our Logistic Regression classifier!
        try:
            pred = predict_category(text)
            if pred and pred.get("confidence", 0) > 0.4:
                category = pred["predicted_category"]
        except Exception:
            # Fallback if model not trained
            category = "Other"

    return {
        "amount": amount,
        "date": target_date.strftime("%Y-%m-%d"),
        "category": category,
        "description": description
    }

import sys
import os

# Add the backend directory to sys.path
sys.path.append(r'c:\Users\student\Desktop\4MH23CS179\fastapi_with_db')

try:
    from db import SessionLocal
    from models import ChatHistory, User
    from utils.ai_response import get_completion
    
    print("Diagnostics started...")
    
    # 1. Test Database Connection
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        print(f"Database connection: OK (Found {user_count} users)")
        
        # Check chat_history columns
        history_item = db.query(ChatHistory).first()
        if history_item:
            print(f"ChatHistory columns: id={history_item.id}, user_id={history_item.user_id}, conv_id={getattr(history_item, 'conversation_id', 'MISSING')}")
        else:
            print("ChatHistory table is empty.")
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        db.close()
        
    # 2. Test AI Completion
    print("Testing AI Completion...")
    try:
        res = get_completion("Hi", "You are a test assistant.")
        print(f"AI Response: {res[:50]}...")
    except Exception as e:
        print(f"AI Error: {e}")

except Exception as e:
    print(f"Unexpected Setup Error: {e}")

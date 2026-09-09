import urllib.request
import json

def trigger_presentation_sms():
    print("🚀 Triggering Hackathon Presentation SMS Demo...")
    url = "http://127.0.0.1:8000/api/simulate"
    
    # We send a massive severity multiplier to force the AI to output a Level 3 Critical Alert
    data = json.dumps({"severity_multiplier": 5.0, "use_live_weather": True}).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    
    try:
        urllib.request.urlopen(req)
        print("✅ SUCCESS! The ML model was forced into a Level 3 state, and the Twilio SMS has been fired to Guwahati!")
    except Exception as e:
        print(f"❌ Failed to trigger SMS: {e}")

if __name__ == "__main__":
    trigger_presentation_sms()

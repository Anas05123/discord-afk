import sys
import time
import urllib.parse
import subprocess
import ctypes

def send_whatsapp(phone: str, text: str):
    clean_phone = "".join(ch for ch in phone if ch.isdigit()) or "21654096479"
    encoded_text = urllib.parse.quote(text)
    uri = f"whatsapp://send?phone={clean_phone}&text={encoded_text}"
    
    # Launch WhatsApp Desktop chat with drafted message
    subprocess.run(["powershell", "-NoProfile", "-Command", f"Start-Process '{uri}'"])
    
    # Wait for WhatsApp to open, focus the input field, and populate the draft
    time.sleep(1.8)
    
    # Simulate ENTER keypress to send the message immediately
    VK_RETURN = 0x0D
    KEYEVENTF_KEYUP = 0x0002
    ctypes.windll.user32.keybd_event(VK_RETURN, 0, 0, 0)
    time.sleep(0.05)
    ctypes.windll.user32.keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, 0)

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        p = sys.argv[1]
        msg = sys.argv[2]
        send_whatsapp(p, msg)
    elif len(sys.argv) == 2:
        send_whatsapp("21654096479", sys.argv[1])

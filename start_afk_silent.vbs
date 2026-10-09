Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\ayari\Desktop\discord-presence-afk"
WshShell.Run """C:\Users\ayari\Desktop\discord-presence-afk\.venv\Scripts\pythonw.exe"" ""C:\Users\ayari\Desktop\discord-presence-afk\cloud_afk\afk_worker.py""", 0, False

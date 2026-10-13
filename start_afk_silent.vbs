Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\ayari\Desktop\discord-presence-afk"
WshShell.Run "node cloud_afk\voice_daemon.mjs", 0, False
Set WshShell = Nothing

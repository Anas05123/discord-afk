import os
import time
import threading
import webbrowser
import requests
from io import BytesIO
from typing import Optional, Dict, Any, List
from PIL import Image

import customtkinter as ctk

from core.rpc_manager import RPCManager
from core.detector import ProcessDetector
from core.config_manager import ConfigManager
from core.voice_afk_client import VoiceAFKClient
from core.games_db import GamesDatabase, VERIFIED_PRESETS
from core.languages_db import LANGUAGES_DB, get_language_by_name_or_id
from core.quest_spoofer import QuestSpoofer, QUEST_GAMES
from gui.tray import SystemTrayManager

# Theme configuration
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# Premium Color Palette
BG_MAIN = "#0f1013"        # Deepest dark background
BG_SIDEBAR = "#14161a"     # Sidebar navigation
BG_SURFACE = "#181a1f"     # Cards and elevated panels
BG_INPUT = "#20232a"       # Form fields and search boxes
BORDER_COLOR = "#2a2d36"   # Subtle borders
COLOR_BLURPLE = "#5865f2"  # Discord Blurple
COLOR_GREEN = "#23a55a"    # Active green
COLOR_RED = "#da373c"      # Warning/Clear red
COLOR_YELLOW = "#f0b232"   # Attention/warning yellow
TEXT_PRIMARY = "#f2f3f5"   # Bright white
TEXT_SECONDARY = "#949ba4" # Subtle gray
TEXT_MUTED = "#686d76"     # Muted caption

class MainWindow(ctk.CTk):
    def __init__(self, config_manager: ConfigManager):
        super().__init__()
        self.config_mgr = config_manager
        self.title("Discord Studio Pro — Custom Presence & 24/7 AFK")
        self.geometry("1180x830")
        self.minsize(1060, 740)
        self.configure(fg_color=BG_MAIN)

        # Core Engines
        self.rpc = RPCManager(status_callback=self._on_rpc_status)
        self.voice_afk = VoiceAFKClient(
            on_status=self._on_voice_status,
            on_ready=self._on_voice_ready,
            on_latency=self._on_voice_latency
        )
        self.detector = ProcessDetector(
            detect_rules=self.config_mgr.get("detect_rules", []),
            on_state_change=self._on_process_detected
        )
        self.quest_spoofer = QuestSpoofer(
            on_status_change=self._on_quest_status,
            on_tick=self._on_quest_tick,
            on_game_switched=self._on_quest_game_switched,
            on_queue_update=self._on_quest_queue_update,
            on_queue_completed=self._on_quest_queue_completed
        )

        self._image_cache: Dict[str, ctk.CTkImage] = {}
        self._voice_uptime_running = False
        self._active_page = "activity"
        self._active_lang_id = "react"
        self._active_preset_key = "vscode"

        # Sidebar & Pages
        self._setup_layout()
        self._load_initial_data()

        # System Tray
        self.tray = SystemTrayManager(
            on_show=self._show_window_from_tray,
            on_toggle_auto=self._toggle_auto_detect_from_tray,
            on_clear=self._clear_activity,
            on_exit=self._safe_exit
        )
        self.tray.start()

        self.protocol("WM_DELETE_WINDOW", self._minimize_to_tray)

        if self.config_mgr.get("auto_detect_enabled", True):
            self.detector.start()

        # Background loops
        self.after(1000, self._update_preview_timer)
        self.after(1000, self._update_voice_uptime)

    # =========================================================================
    # HIGH LEVEL LAYOUT: SIDEBAR + CONTENT AREA
    # =========================================================================
    def _setup_layout(self):
        # Master Container
        self.grid_columnconfigure(0, weight=0, minsize=230)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Left Navigation Sidebar
        self.sidebar = ctk.CTkFrame(self, fg_color=BG_SIDEBAR, corner_radius=0, width=230)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_propagate(False)

        self._build_sidebar()

        # Right Content Viewport (Holds pages)
        self.viewport = ctk.CTkFrame(self, fg_color=BG_MAIN, corner_radius=0)
        self.viewport.grid(row=0, column=1, sticky="nsew")
        self.viewport.grid_columnconfigure(0, weight=1)
        self.viewport.grid_rowconfigure(0, weight=1)

        # Pages
        self.pages: Dict[str, ctk.CTkFrame] = {}
        self._init_pages()
        self._switch_page("activity")

    def _build_sidebar(self):
        # App Branding Header
        brand_box = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        brand_box.pack(fill="x", padx=18, pady=(20, 24))

        title_row = ctk.CTkFrame(brand_box, fg_color="transparent")
        title_row.pack(fill="x")

        logo_dot = ctk.CTkLabel(title_row, text="●", font=ctk.CTkFont(size=18), text_color=COLOR_BLURPLE)
        logo_dot.pack(side="left", padx=(0, 6))

        app_title = ctk.CTkLabel(
            title_row,
            text="Discord Studio",
            font=ctk.CTkFont(family="Segoe UI", size=18, weight="bold"),
            text_color=TEXT_PRIMARY
        )
        app_title.pack(side="left")

        pro_badge = ctk.CTkLabel(
            title_row,
            text="PRO",
            font=ctk.CTkFont(family="Segoe UI", size=10, weight="bold"),
            fg_color=COLOR_BLURPLE,
            text_color="#ffffff",
            corner_radius=4,
            padx=6,
            pady=1
        )
        pro_badge.pack(side="left", padx=(6, 0))

        sub_label = ctk.CTkLabel(
            brand_box,
            text="Presence Studio & 24/7 AFK",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED
        )
        sub_label.pack(anchor="w", padx=2, pady=(2, 0))

        # Nav Items
        self.nav_buttons: Dict[str, ctk.CTkButton] = {}
        nav_items = [
            ("activity", "🎮  Activity Studio"),
            ("quests", "🎯  Discord Quests"),
            ("voice", "🎙️  Voice Room AFK"),
            ("games", "🔎  Game Catalog"),
            ("cloud", "☁️  24/7 Cloud Guide")
        ]

        nav_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        nav_frame.pack(fill="x", padx=12, pady=0)

        for key, text in nav_items:
            btn = ctk.CTkButton(
                nav_frame,
                text=text,
                anchor="w",
                height=40,
                corner_radius=8,
                fg_color="transparent",
                hover_color=BG_SURFACE,
                text_color=TEXT_SECONDARY,
                font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
                command=lambda k=key: self._switch_page(k)
            )
            btn.pack(fill="x", pady=3)
            self.nav_buttons[key] = btn

        # Spacer to push telemetry to bottom
        spacer = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        spacer.pack(fill="both", expand=True)

        # Bottom System Status Card
        status_card = ctk.CTkFrame(self.sidebar, fg_color=BG_SURFACE, corner_radius=10, border_width=1, border_color=BORDER_COLOR)
        status_card.pack(fill="x", padx=12, pady=16)

        s_header = ctk.CTkLabel(status_card, text="SYSTEM STATUS", font=ctk.CTkFont(family="Segoe UI", size=10, weight="bold"), text_color=TEXT_MUTED)
        s_header.pack(anchor="w", padx=12, pady=(10, 4))

        self.lbl_sidebar_rpc = ctk.CTkLabel(
            status_card,
            text="⚪ RPC: Ready",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            text_color=TEXT_SECONDARY,
            anchor="w"
        )
        self.lbl_sidebar_rpc.pack(fill="x", padx=12, pady=2)

        self.lbl_sidebar_voice = ctk.CTkLabel(
            status_card,
            text="⚪ Voice: Offline",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            text_color=TEXT_SECONDARY,
            anchor="w"
        )
        self.lbl_sidebar_voice.pack(fill="x", padx=12, pady=(2, 10))

    def _switch_page(self, page_key: str):
        self._active_page = page_key
        for k, page in self.pages.items():
            if k == page_key:
                page.grid(row=0, column=0, sticky="nsew")
            else:
                page.grid_remove()

        for k, btn in self.nav_buttons.items():
            if k == page_key:
                btn.configure(fg_color=BG_SURFACE, text_color=TEXT_PRIMARY, border_width=1, border_color=COLOR_BLURPLE)
            else:
                btn.configure(fg_color="transparent", text_color=TEXT_SECONDARY, border_width=0)

    def _init_pages(self):
        self.pages["activity"] = self._create_activity_page()
        self.pages["quests"] = self._create_quests_page()
        self.pages["voice"] = self._create_voice_page()
        self.pages["games"] = self._create_games_page()
        self.pages["cloud"] = self._create_cloud_page()

    # =========================================================================
    # PAGE 1: ACTIVITY STUDIO
    # =========================================================================
    def _create_activity_page(self) -> ctk.CTkFrame:
        page = ctk.CTkFrame(self.viewport, fg_color="transparent")
        page.grid_columnconfigure(0, weight=6)
        page.grid_columnconfigure(1, weight=5)
        page.grid_rowconfigure(1, weight=1)

        # Top Header Bar
        top_bar = ctk.CTkFrame(page, fg_color="transparent", height=50)
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew", padx=24, pady=(16, 8))

        title_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        title_box.pack(side="left")

        h_title = ctk.CTkLabel(title_box, text="Activity & Presence Studio", font=ctk.CTkFont(family="Segoe UI", size=19, weight="bold"), text_color=TEXT_PRIMARY)
        h_title.pack(anchor="w")
        h_sub = ctk.CTkLabel(title_box, text="Craft custom Discord profile statuses with verified game art and framework badges.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_SECONDARY)
        h_sub.pack(anchor="w")

        # Header Apply Button
        self.btn_top_apply = ctk.CTkButton(
            top_bar,
            text="✨ Set Activity on Discord",
            height=38,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            fg_color=COLOR_BLURPLE,
            hover_color="#4752c4",
            corner_radius=8,
            command=self._apply_current_activity
        )
        self.btn_top_apply.pack(side="right")

        # Left Column: Configuration Cards (Scrollable)
        left_scroll = ctk.CTkScrollableFrame(page, fg_color="transparent")
        left_scroll.grid(row=1, column=0, sticky="nsew", padx=(20, 10), pady=(0, 16))

        # --- Card A: Verified Game Presets ---
        p_card = self._create_section_card(left_scroll, "⚡ Quick Presets (100% Verified IDs)")
        preset_grid = ctk.CTkFrame(p_card, fg_color="transparent")
        preset_grid.pack(fill="x", padx=14, pady=(0, 12))
        preset_grid.grid_columnconfigure((0, 1, 2, 3), weight=1)

        self.preset_buttons: Dict[str, ctk.CTkButton] = {}
        presets = [
            ("💻 VS Code", "vscode"),
            ("🎯 VALORANT", "valorant"),
            ("🪂 Fortnite", "fortnite"),
            ("🧱 ROBLOX", "roblox"),
            ("⚔️ Genshin", "genshin"),
            ("🛡️ Overwatch", "overwatch"),
            ("☕ Lo-Fi Chill", "chill"),
            ("📚 Deep Study", "studying")
        ]

        for idx, (label, key) in enumerate(presets):
            btn = ctk.CTkButton(
                preset_grid,
                text=label,
                height=32,
                corner_radius=6,
                fg_color=BG_INPUT,
                hover_color=COLOR_BLURPLE,
                text_color=TEXT_PRIMARY,
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                border_width=1,
                border_color=BORDER_COLOR,
                command=lambda k=key: self._apply_named_preset(k)
            )
            r = idx // 4
            c = idx % 4
            btn.grid(row=r, column=c, padx=3, pady=3, sticky="ew")
            self.preset_buttons[key] = btn

        # --- Card B: Framework & Language Badges ---
        lang_card = self._create_section_card(left_scroll, "🏷️ Framework & Language Badge (Small Icon)")
        
        l_desc = ctk.CTkLabel(
            lang_card,
            text="Choose your active programming technology badge (renders as a small badge on your profile):",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED
        )
        l_desc.pack(anchor="w", padx=14, pady=(0, 8))

        pill_grid = ctk.CTkFrame(lang_card, fg_color="transparent")
        pill_grid.pack(fill="x", padx=14, pady=(0, 14))
        pill_grid.grid_columnconfigure((0, 1, 2, 3), weight=1)

        self.lang_pills: Dict[str, ctk.CTkButton] = {}
        for idx, item in enumerate(LANGUAGES_DB[:12]):
            btn = ctk.CTkButton(
                pill_grid,
                text=f"{item['emoji']} {item['name']}",
                height=30,
                corner_radius=15,
                fg_color=BG_INPUT,
                hover_color=COLOR_BLURPLE,
                text_color=TEXT_PRIMARY,
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                border_width=1,
                border_color=BORDER_COLOR,
                command=lambda lid=item["id"]: self._select_language_badge(lid)
            )
            r = idx // 4
            c = idx % 4
            btn.grid(row=r, column=c, padx=2, pady=2, sticky="ew")
            self.lang_pills[item["id"]] = btn

        # --- Card C: Details Form ---
        form_card = self._create_section_card(left_scroll, "⚙️ Activity Customization")
        
        self.entry_client_id = self._create_clean_input(form_card, "Application ID (Client ID):", "810516608442695700")
        self.entry_details = self._create_clean_input(form_card, "Details (Line 1):", "Editing SyntaFlow")
        self.entry_state = self._create_clean_input(form_card, "State (Line 2):", "Working Editing SyntaFlow Integrations")
        self.entry_large_img = self._create_clean_input(form_card, "Large Image Key or HTTPS URL:", "vscode")
        self.entry_large_text = self._create_clean_input(form_card, "Large Image Tooltip:", "Visual Studio Code")
        self.entry_small_img = self._create_clean_input(form_card, "Small Badge URL / Key (Optional):", "")
        self.entry_small_text = self._create_clean_input(form_card, "Small Badge Tooltip (Optional):", "")

        self.var_show_timer = ctk.BooleanVar(value=True)
        self.cb_timer = ctk.CTkCheckBox(
            form_card,
            text="Show Elapsed Timer",
            variable=self.var_show_timer,
            command=self._on_field_change,
            fg_color=COLOR_BLURPLE,
            font=ctk.CTkFont(family="Segoe UI", size=12)
        )
        self.cb_timer.pack(anchor="w", padx=14, pady=(8, 12))

        # Profile Buttons
        btn_lbl = ctk.CTkLabel(form_card, text="Profile Clickable Buttons (Optional):", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_SECONDARY)
        btn_lbl.pack(anchor="w", padx=14, pady=(4, 2))

        b1_box = ctk.CTkFrame(form_card, fg_color="transparent")
        b1_box.pack(fill="x", padx=14, pady=2)
        self.entry_b1_label = ctk.CTkEntry(b1_box, placeholder_text="Button 1 Label", width=120, height=32, corner_radius=6, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_b1_label.pack(side="left", padx=(0, 6))
        self.entry_b1_label.bind("<KeyRelease>", lambda e: self._on_field_change())
        self.entry_b1_url = ctk.CTkEntry(b1_box, placeholder_text="Button 1 URL (https://...)", height=32, corner_radius=6, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_b1_url.pack(side="left", fill="x", expand=True)
        self.entry_b1_url.bind("<KeyRelease>", lambda e: self._on_field_change())

        b2_box = ctk.CTkFrame(form_card, fg_color="transparent")
        b2_box.pack(fill="x", padx=14, pady=(2, 14))
        self.entry_b2_label = ctk.CTkEntry(b2_box, placeholder_text="Button 2 Label", width=120, height=32, corner_radius=6, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_b2_label.pack(side="left", padx=(0, 6))
        self.entry_b2_label.bind("<KeyRelease>", lambda e: self._on_field_change())
        self.entry_b2_url = ctk.CTkEntry(b2_box, placeholder_text="Button 2 URL (https://...)", height=32, corner_radius=6, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_b2_url.pack(side="left", fill="x", expand=True)
        self.entry_b2_url.bind("<KeyRelease>", lambda e: self._on_field_change())

        # --- Card D: Auto-Detect ---
        ad_card = self._create_section_card(left_scroll, "🤖 Smart File & App Auto-Detection")
        ad_desc = ctk.CTkLabel(
            ad_card,
            text="Inspects active files in VS Code (.tsx/.jsx ➔ React, .py ➔ Python, .ts ➔ TypeScript)\nand automatically updates your Discord presence without clicking!",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            justify="left"
        )
        ad_desc.pack(anchor="w", padx=14, pady=(0, 8))

        self.var_autodetect = ctk.BooleanVar(value=self.config_mgr.get("auto_detect_enabled", True))
        self.sw_autodetect = ctk.CTkSwitch(
            ad_card,
            text="Enable Auto-Detect Coding & Active Files",
            variable=self.var_autodetect,
            command=self._on_toggle_autodetect,
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            progress_color=COLOR_GREEN
        )
        self.sw_autodetect.pack(anchor="w", padx=14, pady=(0, 6))

        self.lbl_detect_status = ctk.CTkLabel(ad_card, text="● Status: Active & Monitoring processes", font=ctk.CTkFont(family="Segoe UI", size=11), text_color=COLOR_GREEN)
        self.lbl_detect_status.pack(anchor="w", padx=14, pady=(0, 12))

        # Right Column: Discord Profile Card & Action Bar
        right_panel = ctk.CTkFrame(page, fg_color="transparent")
        right_panel.grid(row=1, column=1, sticky="nsew", padx=(10, 20), pady=(0, 16))

        self._build_discord_popout(right_panel)

        return page

    def _build_discord_popout(self, parent):
        # Section Label
        p_lbl = ctk.CTkLabel(parent, text="LIVE PROFILE PREVIEW", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_MUTED)
        p_lbl.pack(anchor="w", padx=4, pady=(0, 8))

        # Main Discord Profile Popout Card
        popout = ctk.CTkFrame(parent, fg_color="#111214", corner_radius=14, border_width=1, border_color=BORDER_COLOR)
        popout.pack(fill="x", pady=(0, 14))

        # Banner Header
        banner = ctk.CTkFrame(popout, height=64, corner_radius=0, fg_color=COLOR_BLURPLE)
        banner.pack(fill="x", side="top")
        banner.pack_propagate(False)

        # Avatar Row
        avatar_box = ctk.CTkFrame(popout, fg_color="transparent")
        avatar_box.pack(fill="x", padx=18, pady=(10, 6))

        av_frame = ctk.CTkFrame(avatar_box, width=50, height=50, corner_radius=25, fg_color=BG_SURFACE)
        av_frame.pack(side="left", padx=(0, 12))
        av_frame.pack_propagate(False)

        lbl_av = ctk.CTkLabel(av_frame, text="👤", font=ctk.CTkFont(size=24))
        lbl_av.place(relx=0.5, rely=0.5, anchor="center")

        user_col = ctk.CTkFrame(avatar_box, fg_color="transparent")
        user_col.pack(side="left", fill="x", expand=True)

        self.lbl_profile_username = ctk.CTkLabel(user_col, text="Discord User", font=ctk.CTkFont(family="Segoe UI", size=15, weight="bold"), text_color=TEXT_PRIMARY, anchor="w")
        self.lbl_profile_username.pack(fill="x")

        status_text = ctk.CTkLabel(user_col, text="● Online", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=COLOR_GREEN, anchor="w")
        status_text.pack(fill="x")

        # Divider line
        div = ctk.CTkFrame(popout, height=1, fg_color=BORDER_COLOR)
        div.pack(fill="x", padx=18, pady=6)

        # Activity Header
        self.card_header = ctk.CTkLabel(popout, text="PLAYING A GAME", font=ctk.CTkFont(family="Segoe UI", size=10, weight="bold"), text_color=TEXT_SECONDARY)
        self.card_header.pack(anchor="w", padx=18, pady=(6, 4))

        # Activity Content Row
        act_row = ctk.CTkFrame(popout, fg_color="transparent")
        act_row.pack(fill="x", padx=18, pady=4)

        # Overlapping Canvas for Art + Badge
        self.image_canvas = ctk.CTkFrame(act_row, width=80, height=80, fg_color="transparent")
        self.image_canvas.pack(side="left", padx=(0, 14))
        self.image_canvas.pack_propagate(False)

        # Large Art Frame
        self.large_art_frame = ctk.CTkFrame(self.image_canvas, width=72, height=72, corner_radius=10, fg_color=BG_SURFACE)
        self.large_art_frame.place(x=0, y=0)
        self.large_art_frame.pack_propagate(False)
        self.lbl_preview_large_img = ctk.CTkLabel(self.large_art_frame, text="💻", font=ctk.CTkFont(size=32))
        self.lbl_preview_large_img.place(relx=0.5, rely=0.5, anchor="center")

        # Small Badge Frame (Overlapping bottom-right)
        self.small_badge_frame = ctk.CTkFrame(self.image_canvas, width=28, height=28, corner_radius=14, fg_color="#111214", border_width=2, border_color=BORDER_COLOR)
        self.small_badge_frame.place(x=52, y=52)
        self.small_badge_frame.pack_propagate(False)
        self.lbl_preview_small_img = ctk.CTkLabel(self.small_badge_frame, text="⚛️", font=ctk.CTkFont(size=13))
        self.lbl_preview_small_img.place(relx=0.5, rely=0.5, anchor="center")

        # Information Column
        info_col = ctk.CTkFrame(act_row, fg_color="transparent")
        info_col.pack(side="left", fill="x", expand=True)

        self.lbl_preview_name = ctk.CTkLabel(info_col, text="Visual Studio Code", font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"), text_color=TEXT_PRIMARY, anchor="w")
        self.lbl_preview_name.pack(fill="x", pady=1)

        self.lbl_preview_details = ctk.CTkLabel(info_col, text="Editing App.tsx", font=ctk.CTkFont(family="Segoe UI", size=11), text_color="#dbdee1", anchor="w")
        self.lbl_preview_details.pack(fill="x", pady=1)

        self.lbl_preview_state = ctk.CTkLabel(info_col, text="Workspace: React-Project", font=ctk.CTkFont(family="Segoe UI", size=11), text_color=TEXT_SECONDARY, anchor="w")
        self.lbl_preview_state.pack(fill="x", pady=1)

        self.lbl_preview_timer = ctk.CTkLabel(info_col, text="00:00 elapsed", font=ctk.CTkFont(family="Segoe UI", size=10), text_color=TEXT_SECONDARY, anchor="w")
        self.lbl_preview_timer.pack(fill="x", pady=1)

        # Buttons
        self.prev_btn_box = ctk.CTkFrame(popout, fg_color="transparent")
        self.prev_btn_box.pack(fill="x", padx=18, pady=(12, 16))

        self.prev_b1 = ctk.CTkButton(self.prev_btn_box, text="GitHub", height=32, fg_color=BG_SURFACE, hover_color=BORDER_COLOR, font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), corner_radius=6)
        self.prev_b1.pack(fill="x", pady=2)
        self.prev_b2 = ctk.CTkButton(self.prev_btn_box, text="", height=32, fg_color=BG_SURFACE, hover_color=BORDER_COLOR, font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), corner_radius=6)

        # Quick Actions Under Preview
        act_card = ctk.CTkFrame(parent, fg_color=BG_SURFACE, corner_radius=12, border_width=1, border_color=BORDER_COLOR)
        act_card.pack(fill="x", pady=6)

        btn_row = ctk.CTkFrame(act_card, fg_color="transparent")
        btn_row.pack(fill="x", padx=14, pady=12)

        self.btn_clear = ctk.CTkButton(
            btn_row,
            text="🧹 Clear Presence",
            height=34,
            fg_color=BG_INPUT,
            hover_color=COLOR_RED,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._clear_activity
        )
        self.btn_clear.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.btn_tray = ctk.CTkButton(
            btn_row,
            text="📥 Minimize to Tray",
            height=34,
            fg_color=BG_INPUT,
            hover_color=BORDER_COLOR,
            font=ctk.CTkFont(family="Segoe UI", size=11),
            corner_radius=6,
            command=self._minimize_to_tray
        )
        self.btn_tray.pack(side="left", fill="x", expand=True, padx=(4, 0))

    # =========================================================================
    # PAGE: DISCORD QUESTS AUTO-COMPLETER
    # =========================================================================
    def _create_quests_page(self) -> ctk.CTkFrame:
        page = ctk.CTkFrame(self.viewport, fg_color="transparent")
        page.grid_columnconfigure(0, weight=6)
        page.grid_columnconfigure(1, weight=5)
        page.grid_rowconfigure(1, weight=1)

        # Top Bar
        top_bar = ctk.CTkFrame(page, fg_color="transparent", height=50)
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew", padx=24, pady=(16, 8))

        title_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        title_box.pack(side="left")

        h_title = ctk.CTkLabel(
            title_box,
            text="Discord Quests Auto-Completer",
            font=ctk.CTkFont(family="Segoe UI", size=19, weight="bold"),
            text_color=TEXT_PRIMARY
        )
        h_title.pack(anchor="w")
        h_sub = ctk.CTkLabel(
            title_box,
            text="Simulate playing verified quest games to claim official Discord Quest rewards without downloading 100GB+ files.",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=TEXT_SECONDARY
        )
        h_sub.pack(anchor="w")

        # Left Column: Games list & Custom Spoofer
        left_scroll = ctk.CTkScrollableFrame(page, fg_color="transparent")
        left_scroll.grid(row=1, column=0, sticky="nsew", padx=(20, 10), pady=(0, 16))

        # 🔍 Search & Detect Any Game Card
        q_search_card = self._create_section_card(left_scroll, "🔍 Search & Detect Any Game (24,000+ Games)")
        q_search_desc = ctk.CTkLabel(
            q_search_card,
            text="Type any game name (e.g. NTE, Giants, Hellraiser, Helldivers, Cyberpunk, GTA) to auto-detect its executable & launch spoofing:",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            justify="left"
        )
        q_search_desc.pack(anchor="w", padx=14, pady=(6, 8))

        s_row = ctk.CTkFrame(q_search_card, fg_color="transparent")
        s_row.pack(fill="x", padx=14, pady=(0, 8))

        self.entry_quest_search = ctk.CTkEntry(
            s_row,
            placeholder_text="Search game name or executable (e.g. NTE, Giants, Hellraiser)...",
            height=36,
            fg_color=BG_INPUT,
            border_color=BORDER_COLOR
        )
        self.entry_quest_search.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.entry_quest_search.bind("<Return>", lambda e: self._perform_quest_game_search())

        btn_q_search = ctk.CTkButton(
            s_row,
            text="Detect Game",
            width=100,
            height=36,
            fg_color=COLOR_BLURPLE,
            hover_color="#4752c4",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            command=self._perform_quest_game_search
        )
        btn_q_search.pack(side="left")

        self.quest_search_results_frame = ctk.CTkFrame(q_search_card, fg_color="transparent")
        self.quest_search_results_frame.pack(fill="x", padx=14, pady=(0, 8))

        # Popular Games Card
        g_card = self._create_section_card(left_scroll, "🎯 Popular & Trending Discord Quest Games")

        info_label = ctk.CTkLabel(
            g_card,
            text="Accept the quest in Discord (User Settings > Gift Inventory), then click Launch Spoof below:",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            justify="left"
        )
        info_label.pack(anchor="w", padx=14, pady=(6, 8))

        top_btn_row = ctk.CTkFrame(g_card, fg_color="transparent")
        top_btn_row.pack(fill="x", padx=14, pady=(0, 8))

        btn_queue_all = ctk.CTkButton(
            top_btn_row,
            text="⚡ Auto-Queue Top Quests (NTE + Giants + Hellraiser + Genshin)",
            height=32,
            fg_color=COLOR_BLURPLE,
            hover_color="#4752c4",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._queue_top_games
        )
        btn_queue_all.pack(fill="x")

        # List of Games
        for game in QUEST_GAMES:
            row = ctk.CTkFrame(g_card, fg_color=BG_INPUT, corner_radius=8)
            row.pack(fill="x", padx=14, pady=4)

            icon_lbl = ctk.CTkLabel(
                row,
                text=game["emoji"],
                font=ctk.CTkFont(size=20),
                width=36
            )
            icon_lbl.pack(side="left", padx=(10, 6), pady=8)

            txt_box = ctk.CTkFrame(row, fg_color="transparent")
            txt_box.pack(side="left", fill="x", expand=True, pady=4)

            n_lbl = ctk.CTkLabel(
                txt_box,
                text=game["name"],
                font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
                text_color=TEXT_PRIMARY,
                anchor="w"
            )
            n_lbl.pack(fill="x")

            d_lbl = ctk.CTkLabel(
                txt_box,
                text=f"{game['desc']} • {game['exe']}",
                font=ctk.CTkFont(family="Segoe UI", size=10),
                text_color=TEXT_MUTED,
                anchor="w"
            )
            d_lbl.pack(fill="x")

            btn_launch = ctk.CTkButton(
                row,
                text="Launch Spoof",
                width=95,
                height=30,
                fg_color=COLOR_BLURPLE,
                hover_color="#4752c4",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                corner_radius=6,
                command=lambda g=game: self._start_quest_spoofer(g)
            )
            btn_launch.pack(side="right", padx=(4, 10), pady=8)

            btn_add_q = ctk.CTkButton(
                row,
                text="➕ Queue",
                width=75,
                height=30,
                fg_color=BG_SURFACE,
                hover_color="#2b2d35",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                corner_radius=6,
                command=lambda g=game: self._add_game_to_queue(g)
            )
            btn_add_q.pack(side="right", padx=(4, 0), pady=8)

        # Custom Executable Card
        c_card = self._create_section_card(left_scroll, "⚙️ Custom Quest Executable")
        c_desc = ctk.CTkLabel(
            c_card,
            text="If Discord adds a new game quest, enter its executable name below to simulate it:",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            justify="left"
        )
        c_desc.pack(anchor="w", padx=14, pady=(6, 8))

        c_row = ctk.CTkFrame(c_card, fg_color="transparent")
        c_row.pack(fill="x", padx=14, pady=(0, 14))

        self.entry_custom_quest_exe = ctk.CTkEntry(
            c_row,
            placeholder_text="e.g. palworld.exe or wutheringwaves.exe",
            height=36,
            fg_color=BG_INPUT,
            border_color=BORDER_COLOR
        )
        self.entry_custom_quest_exe.pack(side="left", fill="x", expand=True, padx=(0, 8))

        btn_custom = ctk.CTkButton(
            c_row,
            text="Launch Custom",
            width=105,
            height=36,
            fg_color=BG_INPUT,
            hover_color=COLOR_BLURPLE,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            command=self._start_custom_quest_spoofer
        )
        btn_custom.pack(side="left", padx=(0, 4))

        btn_custom_q = ctk.CTkButton(
            c_row,
            text="➕ Queue Custom",
            width=105,
            height=36,
            fg_color=BG_SURFACE,
            hover_color="#2b2d35",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            command=self._queue_custom_game
        )
        btn_custom_q.pack(side="left")

        # Right Column: Live Quest Monitor, Queue Playlist & Instructions
        right_panel = ctk.CTkScrollableFrame(page, fg_color="transparent")
        right_panel.grid(row=1, column=1, sticky="nsew", padx=(10, 20), pady=(0, 16))

        # Status & Progress Card
        prog_card = self._create_section_card(right_panel, "⏱️ Live Quest Progress")

        self.lbl_quest_status = ctk.CTkLabel(
            prog_card,
            text="⚪ Status: Idle (No game running)",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            text_color=TEXT_MUTED,
            anchor="w"
        )
        self.lbl_quest_status.pack(fill="x", padx=14, pady=(10, 4))

        self.lbl_quest_game = ctk.CTkLabel(
            prog_card,
            text="Active Game: None",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=TEXT_SECONDARY,
            anchor="w"
        )
        self.lbl_quest_game.pack(fill="x", padx=14, pady=2)

        self.lbl_quest_exe = ctk.CTkLabel(
            prog_card,
            text="Process Name: -",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            anchor="w"
        )
        self.lbl_quest_exe.pack(fill="x", padx=14, pady=2)

        self.lbl_quest_rpc_status = ctk.CTkLabel(
            prog_card,
            text="Discord Activity: ⚪ Idle",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            text_color=TEXT_MUTED,
            anchor="w"
        )
        self.lbl_quest_rpc_status.pack(fill="x", padx=14, pady=(2, 10))

        # Timer & Progress Bar
        timer_box = ctk.CTkFrame(prog_card, fg_color=BG_INPUT, corner_radius=8)
        timer_box.pack(fill="x", padx=14, pady=6)

        self.lbl_quest_timer = ctk.CTkLabel(
            timer_box,
            text="00:00 / 15:00",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color=COLOR_BLURPLE
        )
        self.lbl_quest_timer.pack(pady=(10, 4))

        self.lbl_quest_target_note = ctk.CTkLabel(
            timer_box,
            text="Standard Quest Duration: 15 Minutes",
            font=ctk.CTkFont(family="Segoe UI", size=10),
            text_color=TEXT_MUTED
        )
        self.lbl_quest_target_note.pack(pady=(0, 8))

        self.quest_progress_bar = ctk.CTkProgressBar(
            prog_card,
            height=10,
            fg_color=BG_INPUT,
            progress_color=COLOR_GREEN,
            corner_radius=5
        )
        self.quest_progress_bar.set(0.0)
        self.quest_progress_bar.pack(fill="x", padx=14, pady=(8, 12))

        self.btn_stop_quest = ctk.CTkButton(
            prog_card,
            text="⏹️ Stop Game Spoofer",
            height=36,
            fg_color=BG_INPUT,
            hover_color=COLOR_RED,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._stop_quest_spoofer
        )
        self.btn_stop_quest.pack(fill="x", padx=14, pady=(0, 14))

        # Auto-Quest Queue & Playlist Card
        queue_card = self._create_section_card(right_panel, "📋 Auto-Quest Queue & Playlist")

        q_dur_row = ctk.CTkFrame(queue_card, fg_color="transparent")
        q_dur_row.pack(fill="x", padx=14, pady=(8, 4))

        lbl_dur = ctk.CTkLabel(
            q_dur_row,
            text="Duration / Game:",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            text_color=TEXT_SECONDARY
        )
        lbl_dur.pack(side="left", padx=(0, 6))

        self.queue_duration_menu = ctk.CTkOptionMenu(
            q_dur_row,
            values=["15 min (Standard Quest)", "10 min", "5 min (Quick)", "1 min (Test)"],
            command=self._on_queue_duration_changed,
            fg_color=BG_INPUT,
            button_color=COLOR_BLURPLE,
            button_hover_color="#4752c4",
            dropdown_fg_color=BG_SURFACE,
            font=ctk.CTkFont(family="Segoe UI", size=11),
            height=28,
            width=170
        )
        self.queue_duration_menu.pack(side="left")

        q_ctrl_row = ctk.CTkFrame(queue_card, fg_color="transparent")
        q_ctrl_row.pack(fill="x", padx=14, pady=(6, 8))

        self.btn_start_queue = ctk.CTkButton(
            q_ctrl_row,
            text="▶️ Start Queue",
            height=32,
            fg_color=COLOR_BLURPLE,
            hover_color="#4752c4",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._start_quest_queue
        )
        self.btn_start_queue.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.btn_skip_queue = ctk.CTkButton(
            q_ctrl_row,
            text="⏭️ Skip",
            width=65,
            height=32,
            fg_color=BG_INPUT,
            hover_color="#2f333d",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._skip_quest_queue
        )
        self.btn_skip_queue.pack(side="left", padx=(0, 4))

        self.btn_clear_queue = ctk.CTkButton(
            q_ctrl_row,
            text="🗑️ Clear",
            width=65,
            height=32,
            fg_color=BG_INPUT,
            hover_color=COLOR_RED,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            corner_radius=6,
            command=self._clear_quest_queue
        )
        self.btn_clear_queue.pack(side="left")

        self.queue_items_frame = ctk.CTkScrollableFrame(
            queue_card,
            fg_color=BG_INPUT,
            height=130,
            corner_radius=8
        )
        self.queue_items_frame.pack(fill="x", padx=14, pady=(0, 10))

        self.lbl_queue_empty = ctk.CTkLabel(
            self.queue_items_frame,
            text="No games in queue.\nClick '➕ Queue' on any game to build your auto-playlist!",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_MUTED,
            justify="center"
        )
        self.lbl_queue_empty.pack(pady=24)

        # Step by Step Guide Card
        guide_card = self._create_section_card(right_panel, "📋 How to Claim Quest Rewards")
        guide_text = ctk.CTkLabel(
            guide_card,
            text=(
                "1. Open Discord desktop client.\n"
                "2. Go to User Settings > Gift Inventory / Quests.\n"
                "3. Click 'Accept Quest' on any featured game.\n"
                "4. In this app, click 'Launch Spoof' on the game.\n"
                "5. Discord will show 'Playing [Game]' automatically!\n"
                "6. Let the 15-minute timer finish.\n"
                "7. If the quest requires streaming to a friend:\n"
                "   Join a call and screen-share any window.\n"
                "8. Head to Discord and click 'Claim Reward'!"
            ),
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=TEXT_SECONDARY,
            justify="left"
        )
        guide_text.pack(anchor="w", padx=14, pady=(8, 14))

        # Required Discord Settings Card
        set_card = self._create_section_card(right_panel, "⚙️ Required Discord Setting")
        set_text = ctk.CTkLabel(
            set_card,
            text=(
                "For Discord to broadcast and track your game:\n"
                "1. In Discord: Open User Settings ⚙️\n"
                "2. Go to 'Activity Privacy'\n"
                "3. Turn ON: 'Display current activity as a status message'\n"
                "4. Check 'Registered Games' to see the game active!"
            ),
            font=ctk.CTkFont(family="Segoe UI", size=10),
            text_color=COLOR_YELLOW,
            justify="left"
        )
        set_text.pack(anchor="w", padx=14, pady=(6, 12))

        return page

    # =========================================================================
    # PAGE 2: VOICE ROOM AFK
    # =========================================================================
    def _create_voice_page(self) -> ctk.CTkFrame:
        page = ctk.CTkFrame(self.viewport, fg_color="transparent")
        page.grid_columnconfigure(0, weight=6)
        page.grid_columnconfigure(1, weight=5)
        page.grid_rowconfigure(1, weight=1)

        # Top Bar
        top_bar = ctk.CTkFrame(page, fg_color="transparent", height=50)
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew", padx=24, pady=(16, 8))

        title_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        title_box.pack(side="left")

        h_title = ctk.CTkLabel(title_box, text="Voice Room AFK Connection", font=ctk.CTkFont(family="Segoe UI", size=19, weight="bold"), text_color=TEXT_PRIMARY)
        h_title.pack(anchor="w")
        h_sub = ctk.CTkLabel(title_box, text="Join and remain in any Discord voice channel or AFK room with automatic mute and deafen.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_SECONDARY)
        h_sub.pack(anchor="w")

        # Left Column: Inputs
        left_scroll = ctk.CTkScrollableFrame(page, fg_color="transparent")
        left_scroll.grid(row=1, column=0, sticky="nsew", padx=(20, 10), pady=(0, 16))

        v_card = self._create_section_card(left_scroll, "🔐 Connection Credentials")

        t_lbl = ctk.CTkLabel(v_card, text="Discord Account Token:", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_SECONDARY)
        t_lbl.pack(anchor="w", padx=14, pady=(8, 2))

        token_row = ctk.CTkFrame(v_card, fg_color="transparent")
        token_row.pack(fill="x", padx=14, pady=(0, 6))

        self.entry_token = ctk.CTkEntry(token_row, placeholder_text="Paste your user token here...", show="•", height=34, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_token.pack(side="left", fill="x", expand=True, padx=(0, 6))

        self.btn_toggle_token = ctk.CTkButton(token_row, text="👁️", width=36, height=34, fg_color=BG_INPUT, hover_color=BORDER_COLOR, command=self._toggle_token_visibility)
        self.btn_toggle_token.pack(side="left")

        # Server select row
        server_head = ctk.CTkFrame(v_card, fg_color="transparent")
        server_head.pack(fill="x", padx=14, pady=(6, 2))
        lbl_s = ctk.CTkLabel(server_head, text="Server ID (Guild ID):", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_SECONDARY)
        lbl_s.pack(side="left")

        btn_fetch = ctk.CTkButton(
            server_head,
            text="⚡ Select From My Servers",
            height=24,
            fg_color=BG_INPUT,
            hover_color=COLOR_BLURPLE,
            font=ctk.CTkFont(family="Segoe UI", size=10, weight="bold"),
            command=self._fetch_and_show_guilds
        )
        btn_fetch.pack(side="right")

        self.server_select_box = ctk.CTkFrame(v_card, fg_color="transparent")
        self.server_select_box.pack(fill="x", padx=14, pady=0)
        self.server_dropdown = None

        self.entry_guild_id = self._create_clean_input(v_card, "", "Server ID")
        self.entry_channel_id = self._create_clean_input(v_card, "Voice Channel ID:", "Right click voice room -> Copy Channel ID")
        self.entry_afk_activity = self._create_clean_input(v_card, "Custom Activity while in Room (Optional):", "Visual Studio Code")

        opts_box = ctk.CTkFrame(v_card, fg_color="transparent")
        opts_box.pack(fill="x", padx=14, pady=12)

        self.var_self_mute = ctk.BooleanVar(value=True)
        self.cb_mute = ctk.CTkCheckBox(opts_box, text="Self-Mute (Mutes Mic)", variable=self.var_self_mute, fg_color=COLOR_BLURPLE, font=ctk.CTkFont(family="Segoe UI", size=11))
        self.cb_mute.pack(side="left", padx=(0, 16))

        self.var_self_deaf = ctk.BooleanVar(value=True)
        self.cb_deaf = ctk.CTkCheckBox(opts_box, text="Self-Deafen (Zero Bandwidth)", variable=self.var_self_deaf, fg_color=COLOR_BLURPLE, font=ctk.CTkFont(family="Segoe UI", size=11))
        self.cb_deaf.pack(side="left")

        # Action Buttons
        act_box = ctk.CTkFrame(v_card, fg_color="transparent")
        act_box.pack(fill="x", padx=14, pady=(8, 16))

        self.btn_join_voice = ctk.CTkButton(
            act_box,
            text="🟢 Join Voice Room (AFK)",
            height=42,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            fg_color=COLOR_GREEN,
            hover_color="#1a6334",
            corner_radius=8,
            command=self._start_voice_afk
        )
        self.btn_join_voice.pack(fill="x", pady=(0, 6))

        self.btn_leave_voice = ctk.CTkButton(
            act_box,
            text="🔴 Leave Voice Room",
            height=34,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            fg_color=COLOR_RED,
            hover_color="#a1282c",
            corner_radius=8,
            command=self._stop_voice_afk
        )
        self.btn_leave_voice.pack(fill="x")

        # Right Column: Telemetry Card
        right_panel = ctk.CTkFrame(page, fg_color="transparent")
        right_panel.grid(row=1, column=1, sticky="nsew", padx=(10, 20), pady=(0, 16))

        m_card = self._create_section_card(right_panel, "📡 Live Room Telemetry")

        self.lbl_mon_status = ctk.CTkLabel(m_card, text="⚪ Status: Disconnected", font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"), text_color=TEXT_MUTED, anchor="w")
        self.lbl_mon_status.pack(fill="x", padx=14, pady=(10, 4))

        self.lbl_mon_user = ctk.CTkLabel(m_card, text="Account: Not Connected", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_SECONDARY, anchor="w")
        self.lbl_mon_user.pack(fill="x", padx=14, pady=2)

        self.lbl_mon_room = ctk.CTkLabel(m_card, text="Target Channel: -", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_MUTED, anchor="w")
        self.lbl_mon_room.pack(fill="x", padx=14, pady=2)

        self.lbl_mon_uptime = ctk.CTkLabel(m_card, text="Session Uptime: 00:00:00", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_MUTED, anchor="w")
        self.lbl_mon_uptime.pack(fill="x", padx=14, pady=2)

        self.lbl_mon_latency = ctk.CTkLabel(m_card, text="Heartbeat Latency: - ms", font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=COLOR_GREEN, anchor="w")
        self.lbl_mon_latency.pack(fill="x", padx=14, pady=(2, 14))

        return page

    # =========================================================================
    # PAGE 3: GAMES CATALOG
    # =========================================================================
    def _create_games_page(self) -> ctk.CTkFrame:
        page = ctk.CTkFrame(self.viewport, fg_color="transparent")
        page.grid_columnconfigure(0, weight=1)
        page.grid_rowconfigure(1, weight=1)

        top_bar = ctk.CTkFrame(page, fg_color="transparent", height=50)
        top_bar.grid(row=0, column=0, sticky="ew", padx=24, pady=(16, 8))

        title_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        title_box.pack(side="left")

        h_title = ctk.CTkLabel(title_box, text="Discord 24,000+ Games & Applications Catalog", font=ctk.CTkFont(family="Segoe UI", size=19, weight="bold"), text_color=TEXT_PRIMARY)
        h_title.pack(anchor="w")
        h_sub = ctk.CTkLabel(title_box, text="Search any game (Minecraft, GTA, Cyberpunk, Roblox) to auto-fill its verified Discord Application ID.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_SECONDARY)
        h_sub.pack(anchor="w")

        content_box = ctk.CTkScrollableFrame(page, fg_color="transparent")
        content_box.grid(row=1, column=0, sticky="nsew", padx=20, pady=(0, 16))

        search_card = self._create_section_card(content_box, "🔍 Game Search Engine")

        search_row = ctk.CTkFrame(search_card, fg_color="transparent")
        search_row.pack(fill="x", padx=14, pady=(0, 8))

        self.entry_game_search = ctk.CTkEntry(search_row, placeholder_text="Type game or app name (e.g. GTA, Minecraft, Roblox)...", height=38, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        self.entry_game_search.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.entry_game_search.bind("<Return>", lambda e: self._perform_game_search())

        btn_search = ctk.CTkButton(search_row, text="Search", width=90, height=38, font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"), fg_color=COLOR_BLURPLE, command=self._perform_game_search)
        btn_search.pack(side="left")

        self.results_frame = ctk.CTkFrame(search_card, fg_color=BG_INPUT, corner_radius=8)
        self.results_frame.pack(fill="x", padx=14, pady=(8, 14))

        self.lbl_search_status = ctk.CTkLabel(self.results_frame, text="Type a name above and click Search.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_MUTED)
        self.lbl_search_status.pack(padx=14, pady=16)

        return page

    # =========================================================================
    # PAGE 4: 24/7 CLOUD ASSISTANT
    # =========================================================================
    def _create_cloud_page(self) -> ctk.CTkFrame:
        page = ctk.CTkFrame(self.viewport, fg_color="transparent")
        page.grid_columnconfigure(0, weight=1)
        page.grid_rowconfigure(1, weight=1)

        top_bar = ctk.CTkFrame(page, fg_color="transparent", height=50)
        top_bar.grid(row=0, column=0, sticky="ew", padx=24, pady=(16, 8))

        title_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        title_box.pack(side="left")

        h_title = ctk.CTkLabel(title_box, text="24/7 Cloud Assistant (PC Offline Mode)", font=ctk.CTkFont(family="Segoe UI", size=19, weight="bold"), text_color=TEXT_PRIMARY)
        h_title.pack(anchor="w")
        h_sub = ctk.CTkLabel(title_box, text="Keep your account inside your Discord voice channel even when your physical PC is completely shut down.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=TEXT_SECONDARY)
        h_sub.pack(anchor="w")

        c_scroll = ctk.CTkScrollableFrame(page, fg_color="transparent")
        c_scroll.grid(row=1, column=0, sticky="nsew", padx=20, pady=(0, 16))

        card = self._create_section_card(c_scroll, "☁️ How 24/7 Offline Mode Works")
        exp = ctk.CTkLabel(
            card,
            text=(
                "When you turn off your computer, local software terminates.\n\n"
                "To remain 24/7 in an AFK room:\n"
                "1. We provided a lightweight Docker container and Python worker in the 'cloud_afk' folder.\n"
                "2. You can deploy it to Render.com or Koyeb completely FREE (no credit card required).\n"
                "3. The cloud worker maintains the WebSocket voice heartbeat 24 hours a day with self-mute and self-deafen!"
            ),
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=TEXT_SECONDARY,
            justify="left"
        )
        exp.pack(anchor="w", padx=14, pady=(4, 12))

        btn_row = ctk.CTkFrame(card, fg_color="transparent")
        btn_row.pack(fill="x", padx=14, pady=(4, 14))

        btn_guide = ctk.CTkButton(btn_row, text="📖 Open Deployment Guide (Notepad)", height=36, fg_color=BG_INPUT, hover_color=COLOR_BLURPLE, font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"), command=self._open_deploy_guide)
        btn_guide.pack(side="left", padx=(0, 8))

        btn_copy = ctk.CTkButton(btn_row, text="📋 Copy Cloud .env Configuration", height=36, fg_color=BG_INPUT, hover_color=COLOR_BLURPLE, font=ctk.CTkFont(family="Segoe UI", size=12), command=self._copy_env_to_clipboard)
        btn_copy.pack(side="left")

        self.lbl_cloud_feedback = ctk.CTkLabel(card, text="", font=ctk.CTkFont(family="Segoe UI", size=11), text_color=COLOR_GREEN)
        self.lbl_cloud_feedback.pack(anchor="w", padx=14, pady=2)

        return page

    # =========================================================================
    # UI COMPONENT FACTORIES (Clean & Premium)
    # =========================================================================
    def _create_section_card(self, parent, title_text: str) -> ctk.CTkFrame:
        card = ctk.CTkFrame(parent, fg_color=BG_SURFACE, corner_radius=12, border_width=1, border_color=BORDER_COLOR)
        card.pack(fill="x", pady=8)

        lbl = ctk.CTkLabel(card, text=title_text, font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"), text_color=TEXT_PRIMARY)
        lbl.pack(anchor="w", padx=14, pady=(12, 8))
        return card

    def _create_clean_input(self, parent, label_text: str, default_val: str) -> ctk.CTkEntry:
        lbl = ctk.CTkLabel(parent, text=label_text, font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_SECONDARY)
        lbl.pack(anchor="w", padx=14, pady=(4, 2))
        entry = ctk.CTkEntry(parent, placeholder_text=default_val, height=34, corner_radius=6, fg_color=BG_INPUT, border_color=BORDER_COLOR)
        entry.pack(fill="x", padx=14, pady=(0, 4))
        entry.insert(0, default_val)
        entry.bind("<KeyRelease>", lambda e: self._on_field_change())
        return entry

    # =========================================================================
    # LOGIC: LANGUAGE & PRESET HANDLING
    # =========================================================================
    def _select_language_badge(self, lang_id: str):
        item = get_language_by_name_or_id(lang_id)
        if not item:
            return

        self._active_lang_id = lang_id
        for lid, btn in self.lang_pills.items():
            if lid == lang_id:
                btn.configure(fg_color=COLOR_BLURPLE, border_color="#ffffff", border_width=1)
            else:
                btn.configure(fg_color=BG_INPUT, border_color=BORDER_COLOR, border_width=1)

        self.entry_small_img.delete(0, "end")
        self.entry_small_img.insert(0, item["url"])

        self.entry_small_text.delete(0, "end")
        self.entry_small_text.insert(0, item["tooltip"])

        # Auto update details if in programming preset
        cid = self.entry_client_id.get().strip()
        if cid in ["810516608442695700", "383226320970055681"]:
            if item.get("default_details"):
                self.entry_details.delete(0, "end")
                self.entry_details.insert(0, item["default_details"])
            if item.get("default_state"):
                self.entry_state.delete(0, "end")
                self.entry_state.insert(0, item["default_state"])

        self._update_preview()
        self._apply_current_activity()

    def _apply_named_preset(self, key: str):
        self._active_preset_key = key
        for k, btn in self.preset_buttons.items():
            if k == key:
                btn.configure(fg_color=COLOR_BLURPLE, border_color="#ffffff", border_width=1)
            else:
                btn.configure(fg_color=BG_INPUT, border_color=BORDER_COLOR, border_width=1)

        preset = None
        for p in VERIFIED_PRESETS:
            if key in p["name"].lower() or (key == "vscode" and "visual studio code" in p["name"].lower()):
                preset = p
                break
        if not preset:
            preset = self.config_mgr.get_preset(key)

        if not preset:
            return

        self.entry_client_id.delete(0, "end")
        self.entry_client_id.insert(0, preset.get("client_id", "810516608442695700"))

        self.entry_details.delete(0, "end")
        self.entry_details.insert(0, preset.get("details", ""))

        self.entry_state.delete(0, "end")
        self.entry_state.insert(0, preset.get("state", ""))

        self.entry_large_img.delete(0, "end")
        self.entry_large_img.insert(0, preset.get("large_image", ""))

        self.entry_large_text.delete(0, "end")
        self.entry_large_text.insert(0, preset.get("large_text", ""))

        self.entry_small_img.delete(0, "end")
        self.entry_small_img.insert(0, preset.get("small_image", ""))

        self.entry_small_text.delete(0, "end")
        self.entry_small_text.insert(0, preset.get("small_text", ""))

        self._update_preview()
        self._apply_current_activity()

    def _on_field_change(self):
        self._update_preview()

    def _update_preview(self):
        details = self.entry_details.get() or "Playing an activity"
        state = self.entry_state.get() or ""
        large_text = self.entry_large_text.get() or "Activity"

        self.lbl_preview_name.configure(text=large_text if large_text else "Custom Activity")
        self.lbl_preview_details.configure(text=details)
        self.lbl_preview_state.configure(text=state)

        if self.var_show_timer.get():
            self.lbl_preview_timer.pack(fill="x", pady=1)
        else:
            self.lbl_preview_timer.pack_forget()

        b1_lbl = self.entry_b1_label.get().strip()
        if b1_lbl:
            self.prev_b1.configure(text=b1_lbl)
            self.prev_b1.pack(fill="x", pady=2)
        else:
            self.prev_b1.pack_forget()

        b2_lbl = self.entry_b2_label.get().strip()
        if b2_lbl:
            self.prev_b2.configure(text=b2_lbl)
            self.prev_b2.pack(fill="x", pady=2)
        else:
            self.prev_b2.pack_forget()

        # Large image preview
        large_img = self.entry_large_img.get().strip()
        if large_img.startswith("http://") or large_img.startswith("https://"):
            self._load_async_image(large_img, self.lbl_preview_large_img, (60, 60))
        else:
            txt_lower = large_text.lower()
            if "code" in txt_lower or "vs" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="💻", font=ctk.CTkFont(size=30))
            elif "valorant" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="🎯", font=ctk.CTkFont(size=30))
            elif "fortnite" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="🪂", font=ctk.CTkFont(size=30))
            elif "roblox" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="🧱", font=ctk.CTkFont(size=30))
            elif "genshin" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="⚔️", font=ctk.CTkFont(size=30))
            elif "overwatch" in txt_lower:
                self.lbl_preview_large_img.configure(image="", text="🛡️", font=ctk.CTkFont(size=30))
            else:
                self.lbl_preview_large_img.configure(image="", text="🎮", font=ctk.CTkFont(size=30))

        # Small badge preview
        small_img = self.entry_small_img.get().strip()
        if not small_img:
            self.small_badge_frame.place_forget()
        else:
            self.small_badge_frame.place(x=52, y=52)
            if small_img.startswith("http://") or small_img.startswith("https://"):
                self._load_async_image(small_img, self.lbl_preview_small_img, (22, 22))
            else:
                if "react" in small_img.lower():
                    self.lbl_preview_small_img.configure(image="", text="⚛️", font=ctk.CTkFont(size=12))
                elif "python" in small_img.lower():
                    self.lbl_preview_small_img.configure(image="", text="🐍", font=ctk.CTkFont(size=12))
                elif "node" in small_img.lower():
                    self.lbl_preview_small_img.configure(image="", text="💚", font=ctk.CTkFont(size=12))
                elif "rust" in small_img.lower():
                    self.lbl_preview_small_img.configure(image="", text="🦀", font=ctk.CTkFont(size=12))
                else:
                    self.lbl_preview_small_img.configure(image="", text="🏷️", font=ctk.CTkFont(size=12))

    def _load_async_image(self, url: str, target_label: ctk.CTkLabel, size=(60, 60)):
        cache_key = f"{url}_{size[0]}x{size[1]}"
        if cache_key in self._image_cache:
            target_label.configure(image=self._image_cache[cache_key], text="")
            return

        def _fetch():
            try:
                resp = requests.get(url, timeout=3)
                if resp.status_code == 200:
                    img_data = Image.open(BytesIO(resp.content)).convert("RGBA")
                    img_data = img_data.resize(size, Image.Resampling.LANCZOS)
                    ctk_img = ctk.CTkImage(light_image=img_data, dark_image=img_data, size=size)
                    self._image_cache[cache_key] = ctk_img
                    self.after(0, lambda: target_label.configure(image=ctk_img, text=""))
            except Exception:
                pass
        threading.Thread(target=_fetch, daemon=True).start()

    def _update_preview_timer(self):
        if self.var_show_timer.get():
            elapsed = int(time.time() - self.rpc.start_time)
            mins, secs = divmod(elapsed, 60)
            hours, mins = divmod(mins, 60)
            if hours > 0:
                self.lbl_preview_timer.configure(text=f"{hours:02d}:{mins:02d}:{secs:02d} elapsed")
            else:
                self.lbl_preview_timer.configure(text=f"{mins:02d}:{secs:02d} elapsed")
        self.after(1000, self._update_preview_timer)

    def _apply_current_activity(self):
        client_id = self.entry_client_id.get().strip()
        details = self.entry_details.get().strip()
        state = self.entry_state.get().strip()
        large_image = self.entry_large_img.get().strip()
        large_text = self.entry_large_text.get().strip()
        small_image = self.entry_small_img.get().strip()
        small_text = self.entry_small_text.get().strip()
        show_timer = self.var_show_timer.get()

        buttons = []
        b1_lbl = self.entry_b1_label.get().strip()
        b1_url = self.entry_b1_url.get().strip()
        if b1_lbl and b1_url:
            buttons.append({"label": b1_lbl, "url": b1_url})

        b2_lbl = self.entry_b2_label.get().strip()
        b2_url = self.entry_b2_url.get().strip()
        if b2_lbl and b2_url:
            buttons.append({"label": b2_lbl, "url": b2_url})

        self.config_mgr.set("current_activity", {
            "client_id": client_id,
            "details": details,
            "state": state,
            "large_image": large_image,
            "large_text": large_text,
            "small_image": small_image,
            "small_text": small_text,
            "show_timer": show_timer,
            "button1_label": b1_lbl,
            "button1_url": b1_url,
            "button2_label": b2_lbl,
            "button2_url": b2_url
        })

        success = self.rpc.update_presence(
            client_id=client_id,
            details=details,
            state=state,
            large_image=large_image,
            large_text=large_text,
            small_image=small_image,
            small_text=small_text,
            show_timer=show_timer,
            buttons=buttons
        )

        if success:
            self.lbl_sidebar_rpc.configure(text="🟢 RPC: Active", text_color=COLOR_GREEN)
            self.btn_top_apply.configure(text="✅ Activity Updated!", fg_color=COLOR_GREEN)
            self.after(2000, lambda: self.btn_top_apply.configure(text="✨ Set Activity on Discord", fg_color=COLOR_BLURPLE))
        else:
            self.lbl_sidebar_rpc.configure(text="🔴 RPC: Error", text_color=COLOR_RED)

    def _clear_activity(self):
        self.rpc.clear()
        self.lbl_sidebar_rpc.configure(text="⚪ RPC: Cleared", text_color=TEXT_MUTED)

    def _on_rpc_status(self, message: str, is_active: bool):
        def _update():
            if is_active:
                self.lbl_sidebar_rpc.configure(text="🟢 " + message[:22], text_color=COLOR_GREEN)
            else:
                self.lbl_sidebar_rpc.configure(text="⚪ " + message[:22], text_color=TEXT_MUTED)
        self.after(0, _update)

    def _on_process_detected(self, rule: Optional[Dict[str, Any]], detected: bool, metadata: Dict[str, Any]):
        def _update():
            if detected and rule:
                label = rule.get("label", "Application")
                workspace = metadata.get("workspace", "SyntaFlow Integrations")
                file_name = metadata.get("file", "SyntaFlow")
                detected_lang = metadata.get("detected_lang", "none")

                self.lbl_detect_status.configure(text=f"● Detected: {label} ({file_name})", text_color=COLOR_GREEN)
                if detected_lang and detected_lang != "none":
                    self._select_language_badge(detected_lang)
                else:
                    self._select_language_badge("none")

                self.entry_details.delete(0, "end")
                self.entry_details.insert(0, f"Editing {file_name}")
                self.entry_state.delete(0, "end")
                self.entry_state.insert(0, f"Working Editing {workspace}")
                self._update_preview()
                self._apply_current_activity()
            else:
                self.lbl_detect_status.configure(text="● Status: Active & Monitoring processes", text_color=COLOR_GREEN)
        self.after(0, _update)

    def _on_toggle_autodetect(self):
        enabled = self.var_autodetect.get()
        self.config_mgr.set("auto_detect_enabled", enabled)
        self.detector.set_enabled(enabled)
        self.tray.update_auto_detect_state(enabled)

    def _toggle_auto_detect_from_tray(self) -> bool:
        new_val = not self.var_autodetect.get()
        self.var_autodetect.set(new_val)
        self.after(0, self._on_toggle_autodetect)
        return new_val

    # =========================================================================
    # VOICE ROOM LOGIC
    # =========================================================================
    def _toggle_token_visibility(self):
        if self.entry_token.cget("show") == "":
            self.entry_token.configure(show="•")
            self.btn_toggle_token.configure(text="👁️")
        else:
            self.entry_token.configure(show="")
            self.btn_toggle_token.configure(text="🔒")

    def _fetch_and_show_guilds(self):
        token = self.entry_token.get().strip()
        if not token:
            return

        def _fetch():
            try:
                r = requests.get("https://discord.com/api/v10/users/@me/guilds", headers={"Authorization": token}, timeout=5)
                if r.status_code == 200:
                    guilds = r.json()
                    self._guild_map = {f"{g.get('name')} ({g.get('id')})": str(g.get('id')) for g in guilds}
                    options = list(self._guild_map.keys())
                    if options:
                        self.after(0, lambda: self._show_guild_selector(options))
            except Exception:
                pass

        threading.Thread(target=_fetch, daemon=True).start()

    def _show_guild_selector(self, options: List[str]):
        if self.server_dropdown is None:
            self.server_dropdown = ctk.CTkOptionMenu(
                self.server_select_box,
                values=options[:50],
                command=self._on_server_selected,
                fg_color=BG_INPUT,
                button_color=COLOR_BLURPLE,
                button_hover_color="#4752c4",
                dropdown_fg_color=BG_SURFACE,
                font=ctk.CTkFont(family="Segoe UI", size=11),
                height=32
            )
            self.server_dropdown.pack(fill="x", pady=(2, 6))
        else:
            self.server_dropdown.configure(values=options[:50])

    def _on_server_selected(self, choice: str):
        if hasattr(self, "_guild_map") and choice in self._guild_map:
            gid = self._guild_map[choice]
            self.entry_guild_id.delete(0, "end")
            self.entry_guild_id.insert(0, gid)

    def _start_voice_afk(self):
        token = self.entry_token.get().strip()
        guild_id = self.entry_guild_id.get().strip()
        channel_id = self.entry_channel_id.get().strip()
        self_mute = self.var_self_mute.get()
        self_deaf = self.var_self_deaf.get()
        activity = self.entry_afk_activity.get().strip()

        if not token or not guild_id or not channel_id:
            self.lbl_mon_status.configure(text="❌ Error: Missing credentials!", text_color=COLOR_RED)
            return

        self.config_mgr.set("discord_token", token)
        self.config_mgr.set("saved_guild_id", guild_id)
        self.config_mgr.set("saved_channel_id", channel_id)

        self._voice_uptime_running = True
        self.btn_join_voice.configure(state="disabled")
        self.btn_leave_voice.configure(state="normal")
        self.lbl_mon_room.configure(text=f"Target Channel: {channel_id}")

        self.voice_afk.start(
            token=token,
            guild_id=guild_id,
            channel_id=channel_id,
            self_mute=self_mute,
            self_deaf=self_deaf,
            activity_name=activity
        )

    def _stop_voice_afk(self):
        self._voice_uptime_running = False
        self.voice_afk.stop()
        self.btn_join_voice.configure(state="normal")
        self.btn_leave_voice.configure(state="disabled")
        self.lbl_mon_status.configure(text="⚪ Status: Disconnected", text_color=TEXT_MUTED)
        self.lbl_mon_latency.configure(text="Heartbeat Latency: - ms")
        self.lbl_sidebar_voice.configure(text="⚪ Voice: Offline", text_color=TEXT_MUTED)

    def _on_voice_status(self, msg: str, connected: bool):
        def _u():
            if connected:
                self.lbl_mon_status.configure(text="🟢 Status: " + msg, text_color=COLOR_GREEN)
                self.lbl_sidebar_voice.configure(text="🟢 Voice: In Room", text_color=COLOR_GREEN)
            else:
                self.lbl_mon_status.configure(text="⚪ " + msg, text_color=TEXT_MUTED)
                if not self.voice_afk.is_running:
                    self.lbl_sidebar_voice.configure(text="⚪ Voice: Offline", text_color=TEXT_MUTED)
        self.after(0, _u)

    def _on_voice_ready(self, user: Dict[str, Any]):
        def _u():
            username = user.get("username", "User")
            tag = f"{username} (ID: {user.get('id', '')})"
            self.lbl_mon_user.configure(text=f"Account: {tag}")
            self.lbl_profile_username.configure(text=username)
        self.after(0, _u)

    def _on_voice_latency(self, latency_ms: float):
        def _u():
            self.lbl_mon_latency.configure(text=f"Heartbeat Latency: {latency_ms} ms")
        self.after(0, _u)

    def _update_voice_uptime(self):
        if self._voice_uptime_running and self.voice_afk.is_connected:
            sec = int(time.time() - self.voice_afk.start_time)
            mins, secs = divmod(sec, 60)
            hrs, mins = divmod(mins, 60)
            self.lbl_mon_uptime.configure(text=f"Session Uptime: {hrs:02d}:{mins:02d}:{secs:02d}")
        self.after(1000, self._update_voice_uptime)

    # =========================================================================
    # GAMES CATALOG SEARCH
    # =========================================================================
    def _perform_game_search(self):
        query = self.entry_game_search.get().strip()
        if not query:
            return

        for w in self.results_frame.winfo_children():
            w.destroy()

        self.lbl_search_status = ctk.CTkLabel(self.results_frame, text=f"Searching for '{query}' across Discord's catalog...", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=COLOR_BLURPLE)
        self.lbl_search_status.pack(padx=14, pady=16)

        def _async_search():
            matches = GamesDatabase.search_discord_games(query, limit=14)
            self.after(0, lambda: self._display_search_results(matches, query))

        threading.Thread(target=_async_search, daemon=True).start()

    def _display_search_results(self, matches: List[Dict[str, Any]], query: str):
        for w in self.results_frame.winfo_children():
            w.destroy()

        if not matches:
            lbl = ctk.CTkLabel(self.results_frame, text=f"No games found matching '{query}'. Try another search term.", font=ctk.CTkFont(family="Segoe UI", size=12), text_color=COLOR_RED)
            lbl.pack(padx=14, pady=16)
            return

        header = ctk.CTkLabel(self.results_frame, text=f"Found {len(matches)} results for '{query}':", font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"), text_color=TEXT_PRIMARY)
        header.pack(anchor="w", padx=14, pady=(10, 4))

        for item in matches:
            row = ctk.CTkFrame(self.results_frame, fg_color=BG_SURFACE, corner_radius=6, border_width=1, border_color=BORDER_COLOR)
            row.pack(fill="x", padx=10, pady=3)

            icon_lbl = ctk.CTkLabel(row, text=item.get("icon", "🎮"), font=ctk.CTkFont(size=16))
            icon_lbl.pack(side="left", padx=(10, 6), pady=6)

            text_col = ctk.CTkFrame(row, fg_color="transparent")
            text_col.pack(side="left", fill="x", expand=True, pady=4)

            name_lbl = ctk.CTkLabel(text_col, text=item["name"], font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"), text_color=TEXT_PRIMARY, anchor="w")
            name_lbl.pack(fill="x")

            id_lbl = ctk.CTkLabel(text_col, text=f"App ID: {item['id']}", font=ctk.CTkFont(family="Segoe UI", size=10), text_color=TEXT_MUTED, anchor="w")
            id_lbl.pack(fill="x")

            btn_use = ctk.CTkButton(
                row,
                text="Use ID",
                width=72,
                height=28,
                fg_color=COLOR_BLURPLE,
                hover_color="#4752c4",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                corner_radius=4,
                command=lambda cid=item["id"], name=item["name"]: self._select_searched_game(cid, name)
            )
            btn_use.pack(side="right", padx=10, pady=6)

    def _select_searched_game(self, client_id: str, name: str):
        self.entry_client_id.delete(0, "end")
        self.entry_client_id.insert(0, client_id)
        self.entry_large_text.delete(0, "end")
        self.entry_large_text.insert(0, name)
        self._switch_page("activity")
        self._update_preview()
        self._apply_current_activity()

    def _open_deploy_guide(self):
        guide_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cloud_afk", "DEPLOY_GUIDE.md")
        if os.path.exists(guide_path):
            os.system(f'notepad.exe "{guide_path}"')
        else:
            self.lbl_cloud_feedback.configure(text="Guide opened in text viewer.")

    def _copy_env_to_clipboard(self):
        token = self.entry_token.get().strip() or "YOUR_DISCORD_TOKEN"
        guild = self.entry_guild_id.get().strip() or "YOUR_SERVER_ID"
        channel = self.entry_channel_id.get().strip() or "YOUR_VOICE_CHANNEL_ID"
        content = (
            f"DISCORD_TOKEN={token}\n"
            f"GUILD_ID={guild}\n"
            f"CHANNEL_ID={channel}\n"
            f"SELF_MUTE=true\n"
            f"SELF_DEAF=true\n"
            f"ACTIVITY_NAME=Visual Studio Code\n"
            f"PORT=8080"
        )
        self.clipboard_clear()
        self.clipboard_append(content)
        self.lbl_cloud_feedback.configure(text="✅ Configuration copied to clipboard! Paste into Render or .env.")

    def _load_initial_data(self):
        curr = self.config_mgr.get("current_activity", {})
        if curr.get("client_id"):
            self.entry_client_id.delete(0, "end")
            self.entry_client_id.insert(0, curr["client_id"])
        if curr.get("details"):
            self.entry_details.delete(0, "end")
            self.entry_details.insert(0, curr["details"])
        if curr.get("state"):
            self.entry_state.delete(0, "end")
            self.entry_state.insert(0, curr["state"])
        if curr.get("large_image"):
            self.entry_large_img.delete(0, "end")
            self.entry_large_img.insert(0, curr["large_image"])
        if curr.get("large_text"):
            self.entry_large_text.delete(0, "end")
            self.entry_large_text.insert(0, curr["large_text"])
        if curr.get("small_image"):
            self.entry_small_img.delete(0, "end")
            self.entry_small_img.insert(0, curr["small_image"])
        if curr.get("small_text"):
            self.entry_small_text.delete(0, "end")
            self.entry_small_text.insert(0, curr["small_text"])
        if "show_timer" in curr:
            self.var_show_timer.set(curr["show_timer"])
        if curr.get("button1_label"):
            self.entry_b1_label.delete(0, "end")
            self.entry_b1_label.insert(0, curr["button1_label"])
        if curr.get("button1_url"):
            self.entry_b1_url.delete(0, "end")
            self.entry_b1_url.insert(0, curr["button1_url"])

        # Auto-load saved Discord User Token
        saved_token = self.config_mgr.get("discord_token", "")
        if saved_token and hasattr(self, "entry_token"):
            self.entry_token.delete(0, "end")
            self.entry_token.insert(0, saved_token)
            self._fetch_and_show_guilds()

        self._update_preview()

    # =========================================================================
    # QUEST SPOOFER HANDLERS
    # =========================================================================
    def _perform_quest_game_search(self):
        query = self.entry_quest_search.get().strip()
        if not query:
            return

        for w in self.quest_search_results_frame.winfo_children():
            w.destroy()

        results = GamesDatabase.search_discord_games(query, limit=4)
        if not results:
            res = GamesDatabase.resolve_game(query)
            results = [res]

        for item in results:
            row = ctk.CTkFrame(self.quest_search_results_frame, fg_color=BG_INPUT, corner_radius=8)
            row.pack(fill="x", pady=4)

            icon_lbl = ctk.CTkLabel(row, text="🎮", font=ctk.CTkFont(size=18), width=32)
            icon_lbl.pack(side="left", padx=(10, 6), pady=6)

            txt_col = ctk.CTkFrame(row, fg_color="transparent")
            txt_col.pack(side="left", fill="x", expand=True, pady=4)

            n_lbl = ctk.CTkLabel(txt_col, text=item["name"], font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"), text_color=TEXT_PRIMARY, anchor="w")
            n_lbl.pack(fill="x")

            e_lbl = ctk.CTkLabel(txt_col, text=f"Executable: {item['exe']} • App ID: {item['id']}", font=ctk.CTkFont(family="Segoe UI", size=10), text_color=TEXT_MUTED, anchor="w")
            e_lbl.pack(fill="x")

            btn_spoof = ctk.CTkButton(
                row,
                text="🚀 Spoof Now",
                width=110,
                height=30,
                fg_color=COLOR_GREEN,
                hover_color="#1a6334",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                corner_radius=6,
                command=lambda g=item: self._start_quest_spoofer(g)
            )
            btn_spoof.pack(side="right", padx=(4, 10), pady=6)

            btn_add_q = ctk.CTkButton(
                row,
                text="➕ Queue",
                width=75,
                height=30,
                fg_color=BG_SURFACE,
                hover_color="#2b2d35",
                font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
                corner_radius=6,
                command=lambda g=item: self._add_game_to_queue(g)
            )
            btn_add_q.pack(side="right", padx=(4, 0), pady=6)

    def _start_quest_spoofer(self, g_info: Dict[str, Any], custom_exe_name: Optional[str] = None):
        success = self.quest_spoofer.start(g_info, custom_exe_name=custom_exe_name)
        if success:
            game_name = g_info.get("name", "Game")
            client_id = str(g_info.get("client_id") or g_info.get("id") or "1000000000000000001").strip()
            exe_name = custom_exe_name or g_info.get("exe", "game.exe")
            pid = self.quest_spoofer.current_process.pid if self.quest_spoofer.current_process else "-"

            # Synchronize Discord Rich Presence activity so Discord shows "Playing <Game Name>"
            try:
                icon_val = g_info.get("icon")
                large_img = icon_val if (isinstance(icon_val, str) and icon_val.startswith("http")) else None
                self.rpc.update_presence(
                    client_id=client_id,
                    details=f"Playing {game_name}",
                    state="Completing Discord Quest (15m)",
                    large_image=large_img,
                    large_text=f"{game_name} ({exe_name})" if large_img else None,
                    show_timer=True
                )
            except Exception as e:
                print(f"[QuestSpoofer] RPC update notice: {e}")

            self.lbl_quest_status.configure(text=f"🟢 Playing: {game_name}", text_color=COLOR_GREEN)
            self.lbl_quest_game.configure(text=f"Active Game: {game_name}")
            self.lbl_quest_exe.configure(text=f"Process: {exe_name} (PID: {pid})")
            if hasattr(self, "lbl_quest_rpc_status"):
                self.lbl_quest_rpc_status.configure(text=f"Discord Activity: 🟢 Playing {game_name}", text_color=COLOR_GREEN)
            self.btn_stop_quest.configure(fg_color=COLOR_RED)

    def _start_custom_quest_spoofer(self):
        raw = self.entry_custom_quest_exe.get().strip()
        if not raw:
            self.lbl_quest_status.configure(text="⚠️ Please enter a game name or executable", text_color=COLOR_RED)
            return

        g_info = GamesDatabase.resolve_game(raw)
        self._start_quest_spoofer(g_info, custom_exe_name=g_info["exe"])

    def _stop_quest_spoofer(self):
        self.quest_spoofer.stop()
        self.lbl_quest_status.configure(text="⚪ Status: Idle (No game running)", text_color=TEXT_MUTED)
        self.lbl_quest_game.configure(text="Active Game: None")
        self.lbl_quest_exe.configure(text="Process Name: -")
        if hasattr(self, "lbl_quest_rpc_status"):
            self.lbl_quest_rpc_status.configure(text="Discord Activity: ⚪ Idle", text_color=TEXT_MUTED)
        self.btn_stop_quest.configure(fg_color=BG_INPUT)
        self.lbl_quest_timer.configure(text="00:00 / 15:00")
        self.quest_progress_bar.set(0.0)
        self.btn_stop_quest.configure(fg_color=BG_INPUT)

        # Restore normal presence
        self._apply_current_activity()

    def _on_quest_status(self, msg: str, is_running: bool, game_name: Optional[str]):
        color = COLOR_GREEN if is_running else TEXT_MUTED
        self.after(0, lambda: self.lbl_quest_status.configure(text=msg, text_color=color))

    def _on_quest_tick(self, elapsed: int, target: int):
        mins = elapsed // 60
        secs = elapsed % 60
        t_mins = target // 60
        t_secs = target % 60
        pct = min(1.0, elapsed / max(1, target))

        def _update():
            self.lbl_quest_timer.configure(text=f"{mins:02d}:{secs:02d} / {t_mins:02d}:{t_secs:02d}")
            self.quest_progress_bar.set(pct)
            if elapsed >= target:
                self.lbl_quest_status.configure(
                    text="🎉 15-Minute Quest Completed! Claim your reward in Discord!",
                    text_color=COLOR_GREEN
                )

        self.after(0, _update)

    # =========================================================================
    # QUEST QUEUE PLAYLIST CONTROLS & CALLBACKS
    # =========================================================================
    def _on_quest_game_switched(self, next_game: Dict[str, Any]):
        def _u():
            game_name = next_game.get("name", "Game")
            client_id = str(next_game.get("client_id") or next_game.get("id") or "1000000000000000001").strip()
            exe_name = next_game.get("exe", "game.exe")
            pid = self.quest_spoofer.current_process.pid if self.quest_spoofer.current_process else "-"
            icon_val = next_game.get("icon")
            large_img = icon_val if (isinstance(icon_val, str) and icon_val.startswith("http")) else None

            try:
                self.rpc.update_presence(
                    client_id=client_id,
                    details=f"Playing {game_name}",
                    state="Completing Discord Quest (15m)",
                    large_image=large_img,
                    large_text=f"{game_name} ({exe_name})" if large_img else None,
                    show_timer=True
                )
            except Exception as e:
                print(f"[QuestQueue] RPC switch error: {e}")

            self.lbl_quest_status.configure(text=f"🟢 Playing: {game_name}", text_color=COLOR_GREEN)
            self.lbl_quest_game.configure(text=f"Active Game: {game_name}")
            self.lbl_quest_exe.configure(text=f"Process: {exe_name} (PID: {pid})")
            if hasattr(self, "lbl_quest_rpc_status"):
                self.lbl_quest_rpc_status.configure(text=f"Discord Activity: 🟢 Playing {game_name}", text_color=COLOR_GREEN)
            self.btn_stop_quest.configure(fg_color=COLOR_RED)
        self.after(0, _u)

    def _on_quest_queue_update(self, queue: List[Dict[str, Any]], active_idx: int):
        def _u():
            self._render_queue_items(queue, active_idx)
            if hasattr(self, "btn_start_queue"):
                if self.quest_spoofer.is_queue_mode and self.quest_spoofer.is_running:
                    self.btn_start_queue.configure(text="⏸️ Queue Active", fg_color=COLOR_GREEN)
                else:
                    self.btn_start_queue.configure(text="▶️ Start Queue", fg_color=COLOR_BLURPLE)
        self.after(0, _u)

    def _on_quest_queue_completed(self):
        def _u():
            self.lbl_quest_status.configure(text="🎉 All Queued Quests Finished! Ready to claim.", text_color=COLOR_GREEN)
            if hasattr(self, "lbl_quest_rpc_status"):
                self.lbl_quest_rpc_status.configure(text="Discord Activity: ⚪ Idle", text_color=TEXT_MUTED)
            self.btn_stop_quest.configure(fg_color=BG_INPUT)
            if hasattr(self, "btn_start_queue"):
                self.btn_start_queue.configure(text="▶️ Start Queue", fg_color=COLOR_BLURPLE)
        self.after(0, _u)

    def _render_queue_items(self, queue: List[Dict[str, Any]], active_idx: int):
        if not hasattr(self, "queue_items_frame"):
            return
        for widget in self.queue_items_frame.winfo_children():
            widget.destroy()

        if not queue:
            lbl_empty = ctk.CTkLabel(
                self.queue_items_frame,
                text="No games in queue.\nClick '➕ Queue' on any game to build your auto-playlist!",
                font=ctk.CTkFont(family="Segoe UI", size=11),
                text_color=TEXT_MUTED,
                justify="center"
            )
            lbl_empty.pack(pady=20)
            return

        for idx, item in enumerate(queue):
            g = item["game"]
            status = item.get("status", "pending")
            is_active = (idx == active_idx and status == "running")
            row = ctk.CTkFrame(self.queue_items_frame, fg_color="#1f2430" if is_active else BG_SURFACE, corner_radius=6)
            row.pack(fill="x", padx=4, pady=2)

            idx_lbl = ctk.CTkLabel(row, text=f"{idx+1}.", font=ctk.CTkFont(size=10, weight="bold"), text_color=TEXT_MUTED, width=16)
            idx_lbl.pack(side="left", padx=(6, 2), pady=4)

            icon_lbl = ctk.CTkLabel(row, text=g.get("emoji", "🎮"), font=ctk.CTkFont(size=12), width=20)
            icon_lbl.pack(side="left", padx=2, pady=4)

            name_lbl = ctk.CTkLabel(row, text=g.get("name", "Game"), font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"), text_color=TEXT_PRIMARY, anchor="w")
            name_lbl.pack(side="left", fill="x", expand=True, padx=4, pady=4)

            if status == "running":
                badge = ctk.CTkLabel(row, text="⏳ Playing", font=ctk.CTkFont(size=9, weight="bold"), text_color=COLOR_GREEN)
            elif status == "done":
                badge = ctk.CTkLabel(row, text="✅ Done", font=ctk.CTkFont(size=9, weight="bold"), text_color=COLOR_BLURPLE)
            else:
                badge = ctk.CTkLabel(row, text="⏱️ Queued", font=ctk.CTkFont(size=9), text_color=TEXT_MUTED)
            badge.pack(side="left", padx=4, pady=4)

            btn_del = ctk.CTkButton(
                row,
                text="✕",
                width=20,
                height=20,
                fg_color="transparent",
                hover_color=COLOR_RED,
                font=ctk.CTkFont(size=10, weight="bold"),
                command=lambda i=idx: self._remove_from_queue(i)
            )
            btn_del.pack(side="right", padx=(2, 6), pady=4)

    def _add_game_to_queue(self, game_info: Dict[str, Any]):
        self.quest_spoofer.add_to_queue(game_info)
        self.lbl_quest_status.configure(
            text=f"➕ Added '{game_info.get('name', 'Game')}' to Queue ({len(self.quest_spoofer.queue)} total)",
            text_color=COLOR_BLURPLE
        )

    def _remove_from_queue(self, index: int):
        self.quest_spoofer.remove_from_queue(index)

    def _clear_quest_queue(self):
        self.quest_spoofer.clear_queue()
        self.lbl_quest_status.configure(text="🗑️ Quest Queue cleared.", text_color=TEXT_MUTED)

    def _start_quest_queue(self):
        if not self.quest_spoofer.queue:
            self.lbl_quest_status.configure(text="⚠️ Add games to the queue first!", text_color=COLOR_RED)
            return
        self.quest_spoofer.start_queue()

    def _skip_quest_queue(self):
        if self.quest_spoofer.is_queue_mode and self.quest_spoofer.is_running:
            self.quest_spoofer.skip_to_next()
        else:
            self.lbl_quest_status.configure(text="⚠️ No active queue running to skip.", text_color=TEXT_MUTED)

    def _queue_top_games(self):
        top_ids = ["nte", "giants", "hellraiser", "genshin"]
        for tid in top_ids:
            found = next((g for g in QUEST_GAMES if g["id"] == tid), None)
            if found and not any(item["game"].get("id") == tid for item in self.quest_spoofer.queue):
                self.quest_spoofer.add_to_queue(found)
        self.lbl_quest_status.configure(
            text=f"⚡ Queued Top Quests (NTE, Giants, Hellraiser, Genshin) — {len(self.quest_spoofer.queue)} in queue",
            text_color=COLOR_GREEN
        )

    def _queue_custom_game(self):
        raw = self.entry_custom_quest_exe.get().strip()
        if not raw:
            self.lbl_quest_status.configure(text="⚠️ Please enter a game name or executable", text_color=COLOR_RED)
            return
        g_info = GamesDatabase.resolve_game(raw)
        self.quest_spoofer.add_to_queue(g_info)
        self.lbl_quest_status.configure(
            text=f"➕ Added custom '{g_info['name']}' to Queue",
            text_color=COLOR_BLURPLE
        )

    def _on_queue_duration_changed(self, choice: str):
        if "15" in choice:
            self.quest_spoofer.set_target_duration(15)
            self.lbl_quest_target_note.configure(text="Standard Quest Duration: 15 Minutes")
        elif "10" in choice:
            self.quest_spoofer.set_target_duration(10)
            self.lbl_quest_target_note.configure(text="Quest Duration: 10 Minutes")
        elif "5" in choice:
            self.quest_spoofer.set_target_duration(5)
            self.lbl_quest_target_note.configure(text="Quest Duration: 5 Minutes")
        elif "1" in choice:
            self.quest_spoofer.set_target_duration(1)
            self.lbl_quest_target_note.configure(text="Quest Duration: 1 Minute (Test Mode)")

    def _minimize_to_tray(self):
        self.withdraw()

    def _show_window_from_tray(self):
        self.after(0, lambda: (self.deiconify(), self.lift(), self.focus_force()))

    def _safe_exit(self):
        self.quest_spoofer.stop()
        self.voice_afk.stop()
        self.detector.stop()
        self.rpc.disconnect()
        self.tray.stop()
        self.after(0, self.destroy)


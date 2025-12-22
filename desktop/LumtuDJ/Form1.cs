using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.Window;



namespace LumtuDJ
{
    public partial class Form1 : Form
    {
        [DllImport("user32.dll")]
        private static extern bool ReleaseCapture();

        [DllImport("user32.dll")]
        private static extern IntPtr SendMessage(
            IntPtr hWnd, int Msg, int wParam, int lParam);

        private const int WM_NCLBUTTONDOWN = 0xA1;
        private const int HTCAPTION = 0x2;

        private void BeginDrag()
        {
            ReleaseCapture();
            SendMessage(this.Handle, WM_NCLBUTTONDOWN, HTCAPTION, 0);
        }

        private WebView2 webView;

        private Panel titleBarPanel;
        private Label titleLabel;
        private Label btnClose;
        private Label btnMaximize;
        private Label btnMinimize;
        private Label btnFullscreen;

        private const int ResizeBorder = 8;

        private bool isFullscreen = false;
        private Rectangle previousBounds;

        private readonly Color NormalColor = Color.FromArgb(30, 30, 30);
        private readonly Color HoverColor = Color.FromArgb(50, 50, 50);
        private readonly Color PressColor = Color.FromArgb(70, 70, 70);

        public Form1()
        {
            InitializeComponent();

            this.FormBorderStyle = FormBorderStyle.None;
            this.BackColor = NormalColor;
            this.Padding = new Padding(ResizeBorder);

            this.MaximizedBounds = Screen.PrimaryScreen.WorkingArea;

            //InitializeCustomTitleBar();
            InitializeWebView();

            LoadFormSettings();

            // Set correct maximize button text after loading settings
            //btnMaximize.Text = (this.WindowState == FormWindowState.Maximized) ? "❐" : "▢";
        }



        private Color GetColorFromString(string colorString)        
        {
          
            var values = colorString
                .Replace("rgb(", "")
                .Replace(")", "")
                .Split(',');

            Color color = Color.FromArgb(
                int.Parse(values[0]),
                int.Parse(values[1]),
                int.Parse(values[2])
            );

            return color;
        }

        // -----------------------------------------------------
        // WebView2
        // -----------------------------------------------------
        private async void InitializeWebView()
        {
            try
            {
                webView = new WebView2
                {
                    Dock = DockStyle.Fill,
                    Margin = new Padding(0)
                };

                this.Controls.Add(webView);
                webView.BringToFront();

                string userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Lumtu", "WebView2"
                );

                var env = await CoreWebView2Environment.CreateAsync(
                    null, // default browser
                    userDataFolder
                );

                await webView.EnsureCoreWebView2Async(env);
                webView.CoreWebView2.WebMessageReceived += (s, e) =>
                {

                    switch (e.TryGetWebMessageAsString())
                    {
                        case "onclose":
                            this.Close();
                            break;
                        case "onminimize":
                            this.WindowState = FormWindowState.Minimized;
                            break;
                        case "onmaximize":
                            ToggleMaximize();
                            break;
                        case "onfullscreen":
                            BtnFullscreen_Click(this, EventArgs.Empty);
                            break;
                        case "ondragwindow":
                            BeginDrag();
                            break;
                        default:
                            this.BackColor = GetColorFromString(e.TryGetWebMessageAsString());
                            break;
                    }
                };

                webView.CoreWebView2.Navigate("https://lumtu.net/");

            }
            catch (UnauthorizedAccessException uaEx)
            {
                // Provide actionable information for this common failure mode.
                MessageBox.Show(
                    "WebView2 initialization failed due to access denied.\n\n" +
                    "Common causes:\n" +
                    "- The app is installed to a protected folder (e.g. Program Files) and cannot write the default user-data folder.\n" +
                    "- Antivirus or policy is preventing WebView2 from creating files.\n\n" +
                    "Fixes:\n" +
                    "- Ensure the application uses a writable user-data folder (see LocalApplicationData) — already attempted here.\n" +
                    "- Run the app with elevated privileges to verify whether it's a folder-permission issue.\n" +
                    "- Confirm the WebView2 runtime is installed for the machine / user.\n\n" +
                    "Detailed error: " + uaEx.Message,
                    "WebView2 Initialization Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);

                // Re-throw or handle as appropriate for your app's flow.
                throw;
            }
            catch (Exception ex)
            {
                MessageBox.Show("WebView2 initialization failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                throw;
            }
        }

        // -----------------------------------------------------
        // Custom Title Bar (Label Buttons)
        // -----------------------------------------------------
        private void InitializeCustomTitleBar()
        {
            titleBarPanel = new Panel
            {
                Height = 32,
                Dock = DockStyle.Top,
                BackColor = NormalColor,
                Cursor = Cursors.SizeAll
            };

            titleLabel = new Label
            {
                Text = "",
                ForeColor = Color.White,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleLeft,
                Dock = DockStyle.Fill,
                Padding = new Padding(8, 0, 0, 0),
                BackColor = NormalColor
            };

            btnClose = CreateTitleLabel("✕");
            btnClose.Click += (s, e) => this.Close();

            btnMaximize = CreateTitleLabel("▢");
            btnMaximize.Click += (s, e) => ToggleMaximize();

            btnMinimize = CreateTitleLabel("—");
            btnMinimize.Click += (s, e) => this.WindowState = FormWindowState.Minimized;

            btnFullscreen = CreateTitleLabel("⛶");
            btnFullscreen.Click += BtnFullscreen_Click;

            titleBarPanel.Controls.Add(btnFullscreen);
            titleBarPanel.Controls.Add(btnMinimize);
            titleBarPanel.Controls.Add(btnMaximize);
            titleBarPanel.Controls.Add(btnClose);
            titleBarPanel.Controls.Add(titleLabel);

            titleBarPanel.MouseDown += TitleBar_MouseDown;
            titleLabel.MouseDown += TitleBar_MouseDown;

            titleBarPanel.DoubleClick += (s, e) => ToggleMaximize();
            titleLabel.DoubleClick += (s, e) => ToggleMaximize();

            this.Controls.Add(titleBarPanel);
            titleBarPanel.BringToFront();
        }

        private Label CreateTitleLabel(string text)
        {
            var lbl = new Label
            {
                Text = text,
                Dock = DockStyle.Right,
                Width = 45,
                ForeColor = Color.White,
                BackColor = NormalColor,
                TextAlign = ContentAlignment.MiddleCenter,
                Cursor = Cursors.Hand
            };

            lbl.MouseEnter += (s, e) => lbl.BackColor = HoverColor;
            lbl.MouseLeave += (s, e) => lbl.BackColor = NormalColor;
            lbl.MouseDown += (s, e) =>
            {
                if (e.Button == MouseButtons.Left)
                    lbl.BackColor = PressColor;
            };
            lbl.MouseUp += (s, e) => lbl.BackColor = HoverColor;

            return lbl;
        }

        // -----------------------------------------------------
        // Dragging
        // -----------------------------------------------------
        private void TitleBar_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                ReleaseCapture();
                SendMessage(this.Handle, WM_NCLBUTTONDOWN, HTCAPTION, 0);
            }
        }

        // -----------------------------------------------------
        // Maximize / Restore + Update Label Icon
        // -----------------------------------------------------
        private void ToggleMaximize()
        {
            if (this.WindowState == FormWindowState.Normal)
            {
                this.WindowState = FormWindowState.Maximized;
                //btnMaximize.Text = "❐";   // restore icon
            }
            else
            {
                this.WindowState = FormWindowState.Normal;
                //btnMaximize.Text = "▢";   // maximize icon
            }
        }

        // -----------------------------------------------------
        // Fullscreen
        // -----------------------------------------------------
        private void BtnFullscreen_Click(object sender, EventArgs e)
        {

            if (!isFullscreen)
            {
                previousBounds = this.Bounds;
                isFullscreen = true;

                this.WindowState = FormWindowState.Normal;
                this.FormBorderStyle = FormBorderStyle.None;

                this.Bounds = Screen.PrimaryScreen.Bounds;
                this.Padding = new Padding(0);
            }
            else
            {
                isFullscreen = false;

                this.FormBorderStyle = FormBorderStyle.None;
                this.Bounds = previousBounds;
                this.Padding = new Padding(ResizeBorder);
            }
        }

        // -----------------------------------------------------
        // Resize Handling
        // -----------------------------------------------------
        protected override void WndProc(ref Message m)
        {
            const int WM_NCHITTEST = 0x84;
            const int WM_UPDATEUISTATE = 0x0128;
            const int WM_EXITSIZEMOVE = 0x0232;

            const int HTCLIENT = 1;
            const int HTLEFT = 10, HTRIGHT = 11, HTTOP = 12;
            const int HTTOPLEFT = 13, HTTOPRIGHT = 14, HTBOTTOM = 15;
            const int HTBOTTOMLEFT = 16, HTBOTTOMRIGHT = 17;

            if (m.Msg == WM_UPDATEUISTATE) return;

            if (m.Msg == WM_NCHITTEST)
            {
                base.WndProc(ref m);

                if ((int)m.Result == HTCLIENT)
                {
                    Point cursor = PointToClient(new Point((int)m.LParam & 0xFFFF, (int)m.LParam >> 16));
                    int w = this.ClientSize.Width;
                    int h = this.ClientSize.Height;

                    bool left = cursor.X < ResizeBorder;
                    bool right = cursor.X > w - ResizeBorder;
                    bool top = cursor.Y < ResizeBorder;
                    bool bottom = cursor.Y > h - ResizeBorder;

                    if (left && top) m.Result = (IntPtr)HTTOPLEFT;
                    else if (left && bottom) m.Result = (IntPtr)HTBOTTOMLEFT;
                    else if (right && top) m.Result = (IntPtr)HTTOPRIGHT;
                    else if (right && bottom) m.Result = (IntPtr)HTBOTTOMRIGHT;
                    else if (left) m.Result = (IntPtr)HTLEFT;
                    else if (right) m.Result = (IntPtr)HTRIGHT;
                    else if (top) m.Result = (IntPtr)HTTOP;
                    else if (bottom) m.Result = (IntPtr)HTBOTTOM;

                    return;
                }
            }

            if (m.Msg == WM_EXITSIZEMOVE)
                OnResizeFinished();

            base.WndProc(ref m);
        }

        private void OnResizeFinished()
        {
            SaveFormSettings();
        }

        // -----------------------------------------------------
        // Persist Form Size + Position
        // -----------------------------------------------------
        private void LoadFormSettings()
        {
            var settings = Properties.Settings.Default;
            if (settings == null) return;

            Size size = settings.FormSize;
            if (size.Width <= 0 || size.Height <= 0)
                size = new Size(800, 600);

            Point location = settings.FormLocation;
            if (location.X < 0 || location.Y < 0)
                location = new Point(100, 100);

            if(location.X == 0 && location.Y == 0 && settings.FormState == FormWindowState.Normal)
            {
                this.StartPosition = FormStartPosition.CenterScreen;
            }
            else
            {
                Rectangle screenBounds = Screen.PrimaryScreen.WorkingArea;

                this.StartPosition = FormStartPosition.Manual;
                this.Bounds = new Rectangle(location, size);

                if (Enum.IsDefined(typeof(FormWindowState), settings.FormState))
                    this.WindowState = settings.FormState;
                else
                    this.WindowState = FormWindowState.Normal;
            }


        }

        private void SaveFormSettings()
        {
            var settings = Properties.Settings.Default;
            if (settings == null) return;

            if (!isFullscreen)
            {
                if (this.WindowState == FormWindowState.Normal)
                {
                    settings.FormLocation = this.Location;
                    settings.FormSize = this.Size;
                }
                else
                {
                    settings.FormLocation = this.RestoreBounds.Location;
                    settings.FormSize = this.RestoreBounds.Size;
                }

                settings.FormState = this.WindowState;

                try { settings.Save(); } catch { }
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            SaveFormSettings();
            base.OnFormClosing(e);
        }
    }
}

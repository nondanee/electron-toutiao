const {app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, MenuItem} = require('electron')
const path = require('path')

const assetsDir = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on('ready', function() {

  let iconName = 'icon/menubar.png'
  let iconPath = path.join(__dirname, iconName)

  // Setup the menubar with an icon
  tray = new Tray(iconPath)

  if(process.platform === 'darwin') app.dock.hide()

  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })

  tray.on('right-click', function(event) {
    let menu = new Menu()
    menu.append(new MenuItem({ label: 'Quit', click: function() { app.quit() } }))
    tray.popUpContextMenu(menu)

  })

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 380,
    height: 330,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
  })

  // Tell the popup window to load our index.html file
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
})

const toggleWindow = function() {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = function() {
  const trayPos = tray.getBounds()
  const windowPos = window.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }


  window.setPosition(x, y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', function() {
  showWindow()
})

app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
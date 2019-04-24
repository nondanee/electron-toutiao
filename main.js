const {app, BrowserWindow, ipcMain, Tray, Menu, MenuItem} = require('electron')
const path = require('path')

const assetsDir = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on('ready', () => {

	let iconName = 'icon/menubar.png'
	let iconPath = path.join(__dirname, iconName)

	// Setup the menubar with an icon
	tray = new Tray(iconPath)

	if(process.platform === 'darwin') app.dock.hide()

	// Add a click handler so that when the user clicks on the menubar icon, it shows
	// our popup window
	tray.on('click', event => {
		toggleWindow()

		// Show devtools when command clicked
		if (window.isVisible() && process.defaultApp && event.metaKey) window.openDevTools({mode: 'detach'})
	})

	tray.on('right-click', event => {
		let menu = new Menu()
		menu.append(new MenuItem({label: 'Quit', click: () => app.quit()}))
		tray.popUpContextMenu(menu)
	})

	// Make the popup window for the menubar
	window = new BrowserWindow({
		width: 360,
		height: 320,
		show: false,
		frame: false,
		resizable: false,
		transparent: true,
	})

	// Tell the popup window to load our index.html file
	window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

	// Only close the window on blur if dev tools isn't opened
	window.on('blur', () => {
		if(!window.webContents.isDevToolsOpened()) window.hide()
	})
})

const toggleWindow = () => {
	if(window.isVisible())
		window.hide()
	else
		showWindow()
}

const showWindow = () => {
	const trayPos = tray.getBounds()
	const windowPos = window.getBounds()
	let x, y = 0
	if(process.platform == 'darwin'){
		x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
		y = Math.round(trayPos.y + trayPos.height)
		window.setPosition(x, y, false)
	}
	window.show()
	window.focus()
}

ipcMain.on('show-window', () => showWindow())

app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if(process.platform !== 'darwin') app.quit()
})
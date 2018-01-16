const shell = require('electron').shell
const tabs = document.getElementsByClassName('tab')
const view = document.getElementById('view')
const topBar = document.getElementById('top-bar')
const logo = topBar.getElementsByClassName('logo')[0]
let scrollDelay


function storeFocus(i){
	localStorage.setItem('focus', i)
}

function restoreFocus(){
	let focus = localStorage.getItem('focus')
	focus = (focus == null) ? 0 : Number(focus)
	tabs[focus].click()
}

function resetFocus(){
	for(let j=0;j<tabs.length;j++){
		if(tabs[j].className != 'tab'){
			tabs[j].className = 'tab'
		}
	}
	page = 1
	loading = 0
	view.innerHTML = ''
}

function setLoadMore(func){
	view.onscroll = function(){
		if (view.scrollHeight - 120 < view.scrollTop + view.offsetHeight) {
			func()
		}
	}
}

function viewScrollTop(){
	if(view.scrollTop==0){
		clearTimeout(scrollDelay)
	}
	else{
		view.scrollTop -= 40
		scrollDelay=setTimeout('viewScrollTop()',10)
	}
}

logo.onclick = function(event){
	event.stopPropagation()
	shell.openExternal('https://toutiao.io/')
}

topBar.onclick = function(event){
	event.stopPropagation()
	viewScrollTop()
}

for(let i=0; i<tabs.length; i++){
	tabs[i].onclick = function (event){
		event.stopPropagation()
		resetFocus()
		storeFocus(i)
		this.className = 'tab focus'
		if(i==0){			
			recommandFeed()
			setLoadMore(recommandFeed)
		}
		if(i==1){
			javaFeed()
			setLoadMore(javaFeed)
		}
		if(i==2){
			iosFeed()
			setLoadMore(iosFeed)
		}
		if(i==3){
			frontEndFeed()
			setLoadMore(frontEndFeed)
		}
		if(i==4){
			backEndFeed()
			setLoadMore(backEndFeed)
		}
		if(i==5){
			architectureFeed()
			setLoadMore(architectureFeed)
		}
		if(i==6){
			bigDataFeed()
			setLoadMore(bigDataFeed)
		}
	}
}

function addToView(title,meta,praises,comments,avatar,name,postHref,userHref){
	let postDom = document.createElement('div')
	postDom.className = 'post'
	let titleDom = document.createElement('div')
	titleDom.className = 'title'
	titleDom.innerHTML = title
	let metaDom = document.createElement('div')
	metaDom.className = 'meta'
	metaDom.innerHTML = meta
	let relatedDom = document.createElement('div')
	relatedDom.className = 'related'
	let countDom = document.createElement('div')
	countDom.className = 'count'
	let praiseDom = document.createElement('div')
	praiseDom.className = 'praise'
	praiseDom.innerHTML = praises
	let commentDom = document.createElement('div')
	commentDom.className = 'comment'
	commentDom.innerHTML = comments
	let userDom = document.createElement('div')
	userDom.className = 'user'
	let avatarDom = document.createElement('div')
	avatarDom.className = 'avatar'
	avatarDom.style.backgroundImage = 'url('+avatar+')'
	let nameDom = document.createElement('div')
	nameDom.className = 'name'
	nameDom.innerHTML = name

	postDom.onclick = function (event){
		event.stopPropagation()
		shell.openExternal(postHref)
	}
	userDom.onclick = function (event){
		event.stopPropagation()
		shell.openExternal(userHref)
	}

	postDom.appendChild(titleDom)
	postDom.appendChild(metaDom)
	postDom.appendChild(relatedDom)
	relatedDom.appendChild(countDom)
	relatedDom.appendChild(userDom)
	countDom.appendChild(praiseDom)
	countDom.appendChild(commentDom)
	userDom.appendChild(avatarDom)
	userDom.appendChild(nameDom)
	view.appendChild(postDom)
}

document.addEventListener("DOMContentLoaded", function(){
	restoreFocus()
},false)
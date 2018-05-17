const shell = require('electron').shell
const view = document.getElementById('view')
const topBar = document.getElementById('top-bar')
const tabs = document.getElementsByClassName('tab')
const feeds = document.getElementsByClassName('feed')

categories = [
	{"text":"首页","param":"home"},
	{"text":"JAVA","param":"java"},
	{"text":"iOS","param":"ios"},
	{"text":"前端","param":"fe"},
	{"text":"后端","param":"be"},
	{"text":"架构","param":"arch"},
	{"text":"大数据","param":"bigdata"},
	{"text":"区块链","param":"blockchain"},
	{"text":"AI","param":"ai"}
]

function storeFocus(focus){
	localStorage.setItem('focus',focus)
}

function restoreFocus(){
	let focus = localStorage.getItem('focus')
	focus = (focus == null) ? 0 : Number(focus)
	tabs[focus].click()
}

function resetFocus(elements){
	Array.from(elements).forEach(function(element){
		if(element.classList.contains('focus'))
			element.classList.remove('focus')
	})
}

function scrollTop(element){
	let delay = null
	let previous = element.scrollTop
	function scroll(){
		if(element.scrollTop == 0)
			clearTimeout(delay)
		else if(previous != element.scrollTop)
			clearTimeout(delay)
		else{
			previous -= 40
			element.scrollTop = previous
			delay = setTimeout(function(){
				scroll()
			},10)
		}
	}
	scroll()
}



function Feed(catagory) {
	let page = 1
	let loading = false
	let sort = "hot" // or "new"

	let baseUrl = null
	if(catagory.param == "home")
		baseUrl = `https://toutiao.io/prev/`
	else
		baseUrl = `https://toutiao.io/c/${catagory.param}`

	let tab = document.createElement("div")
	tab.className = "tab"
	tab.innerHTML = catagory.text
	topBar.append(tab)

	let feed = document.createElement("div")
	feed.className = "feed"
	view.appendChild(feed)

	function loadMore(){
		if(loading)
			return
		else
			loading = true

		let url = null
		if(catagory.param == "home")
			url = `${baseUrl}${dateStr(page)}`
		else
			url = `${baseUrl}?page=${page}&f=${sort}`

		request(url,function(responseText){
			page += 1
			loading = false
			if(responseText != null){
				let data = parse(responseText)
				let viewFragment = document.createDocumentFragment() 
				data.forEach(function(item){
					viewFragment.appendChild(buildPost(item))
				})
				feed.appendChild(viewFragment)
			}
			else{
				loadMore()
			}
		})
		
	}

	feed.onscroll = function(){
		if (this.scrollHeight - 120 < this.scrollTop + this.offsetHeight){
			loadMore()
		}
	}

	tab.onclick = function(event){
		if(this.classList.contains("focus")){
			scrollTop(feed)
		}
		else{
			storeFocus([].indexOf.call(tabs,tab))
			resetFocus(tabs)
			resetFocus(feeds)
			this.classList.add("focus")
			feed.classList.add("focus")
		}
		if(feed.childNodes.length==0){
			loadMore()
		}
	}

	tab.ondblclick = function(){
		feed.innerHTML = ""
		page = 1
		loadMore()
	}

}


function dateStr(page){
	let date = new Date()
	date.setDate(date.getDate() - (page - 1))
	let day = date.getDate()
	day = (day < 10) ? '0' + day.toString() : day.toString()
	let month = date.getMonth() + 1
	month = (month < 10) ? '0' + month.toString() : month.toString()
	let year = date.getFullYear()
	return `${year}-${month}-${day}`
}


function request(url,callBack){
	let xhr = new XMLHttpRequest()
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4){
			if(xhr.status==200)
				callBack(xhr.responseText)
			else
				callBack()
		}
	}
	xhr.open("GET",url,true)
	xhr.send()
}


function parse(responseText){
	let data = []
	let domParser = new DOMParser()
	let domTree = domParser.parseFromString(responseText, 'text/html')
	let posts = domTree.getElementsByClassName('post')
	Array.from(posts).forEach(function(post){
		let title = post.getElementsByClassName('title')[0].getElementsByTagName('a')[0].innerHTML
		let meta = post.getElementsByClassName('meta')[0].firstChild.wholeText.trim()
		let praises = post.getElementsByClassName('like-button')[0].getElementsByTagName('span')[0].innerHTML
		let comments = post.getElementsByClassName('meta')[0].getElementsByTagName('span')[0].lastChild.wholeText.trim()
		let avatar = post.getElementsByClassName('user-avatar')[0].getElementsByTagName('img')[0].src
		let name = post.getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].innerHTML
		let postHref = 'https://toutiao.io' + post.getElementsByClassName('title')[0].getElementsByTagName('a')[0].getAttribute('href')
		let userHref = 'https://toutiao.io' + post.getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].getAttribute('href')
		data.push({title:title,meta:meta,praises:praises,comments:comments,avatar:avatar,name:name,postHref:postHref,userHref:userHref})
	})
	return data
}

function buildPost(data){
	let post = document.createElement('div')
	post.className = 'post'
	let title = document.createElement('div')
	title.className = 'title'
	title.innerHTML = data.title
	let meta = document.createElement('div')
	meta.className = 'meta'
	meta.innerHTML = data.meta
	let related = document.createElement('div')
	related.className = 'related'
	let count = document.createElement('div')
	count.className = 'count'
	let praise = document.createElement('div')
	praise.className = 'praise'
	praise.innerHTML = data.praises
	let comment = document.createElement('div')
	comment.className = 'comment'
	comment.innerHTML = data.comments
	let user = document.createElement('div')
	user.className = 'user'
	let avatar = document.createElement('div')
	avatar.className = 'avatar'
	avatar.style.backgroundImage = `url(${data.avatar})`
	let name = document.createElement('div')
	name.className = 'name'
	name.innerHTML = data.name

	post.onclick = function(event){
		event.stopPropagation()
		shell.openExternal(data.postHref)
	}
	user.onclick = function(event){
		event.stopPropagation()
		shell.openExternal(data.userHref)
	}

	post.appendChild(title)
	post.appendChild(meta)
	post.appendChild(related)
	related.appendChild(count)
	related.appendChild(user)
	count.appendChild(praise)
	count.appendChild(comment)
	user.appendChild(avatar)
	user.appendChild(name)
	return post
}


document.addEventListener("DOMContentLoaded", function(){
	categories.forEach(function(catagory){
		new Feed(catagory)
	})
	restoreFocus()
},false)




let page = 1
let loading = 0

function recommandFeed(){
	let date = new Date()
	date.setDate(date.getDate() - (page - 1))
	let day = date.getDate()
	day = (day < 10) ? '0' + day.toString() : day.toString()
	let month = date.getMonth() + 1
	month = (month < 10) ? '0' + month.toString() : month.toString()
	let year = date.getFullYear()
	let dateStr = year + '-' + month + '-' + day
	feedRequest("https://toutiao.io/prev/"+dateStr)
}
function javaFeed(){
	feedRequest("https://toutiao.io/c/java?page="+page)
}
function iosFeed(){
	feedRequest("https://toutiao.io/c/ios?page="+page)
}
function frontEndFeed(){
	feedRequest("https://toutiao.io/c/fe?page="+page)
}
function backEndFeed(){
	feedRequest("https://toutiao.io/c/be?page="+page)
}
function architectureFeed(){
	feedRequest("https://toutiao.io/c/arch?page="+page)
}
function bigDataFeed(){
	feedRequest("https://toutiao.io/c/bigdata?page="+page)
}

function feedRequest(url){
	if(loading == 1) return
	loading = 1
	let xhr = new XMLHttpRequest()
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4){
			if(xhr.status==200){
				parse(xhr.responseText)
				page = page + 1
			}
			loading = 0
		}
	}
	xhr.open("GET",url,true)
	xhr.send()
}



function parse(responseText){
	let domParser = new DOMParser()
	let domTree = domParser.parseFromString(responseText, 'text/html')
	let posts = domTree.getElementsByClassName('post')
	for(let i=0;i<posts.length;i++){
		let title = posts[i].getElementsByClassName('title')[0].getElementsByTagName('a')[0].innerHTML
		let meta = posts[i].getElementsByClassName('meta')[0].firstChild.wholeText.trim()
		let praises = posts[i].getElementsByClassName('like-button')[0].getElementsByTagName('span')[0].innerHTML
		let comments = posts[i].getElementsByClassName('meta')[0].getElementsByTagName('span')[0].lastChild.wholeText.trim()
		let avatar = posts[i].getElementsByClassName('user-avatar')[0].getElementsByTagName('img')[0].src
		let name = posts[i].getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].innerHTML
		let postHref = 'https://toutiao.io'+posts[i].getElementsByClassName('title')[0].getElementsByTagName('a')[0].getAttribute('href')
		let userHref = 'https://toutiao.io'+posts[i].getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].getAttribute('href')
		addToView(title,meta,praises,comments,avatar,name,postHref,userHref)
	}
}

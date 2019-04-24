const shell = require('electron').shell
const storage = {
	set: (key, value) => localStorage.setItem(key, value),
	get: key => localStorage.getItem(key)
}

const categories = [
	{'text': '首页', 'query': 'home'},
	{'text': 'JAVA', 'query': 'java'},
	{'text': 'iOS', 'query': 'ios'},
	{'text': '前端', 'query': 'fe'},
	{'text': '后端', 'query': 'be'},
	{'text': '架构', 'query': 'arch'},
	{'text': '大数据', 'query': 'bigdata'},
	{'text': '区块链', 'query': 'blockchain'},
	{'text': 'AI', 'query': 'ai'}
]

window.onload = () => {
	const bar = document.getElementById('bar')
	const view = document.getElementById('view')
	const pages = categories.map(Page)
	pages.forEach((page, index, pages) => {
		bar.appendChild(page.tab)
		view.appendChild(page.feed)
		page.feed.onscroll = () => {
			if(page.feed.scrollHeight - 120 < page.feed.scrollTop + page.feed.offsetHeight) page.loadMore()
		}
		page.tab.onclick = () => {
			if(page.focused()){
				page.scrollTop()
			}
			else{
				pages.filter(page => page.focused()).forEach(page => page.unfocus())
				page.focus()
				storage.set('focus', index)
			}
			if(page.feed.childNodes.length == 0){
				page.loadMore()
			}
		}
		page.tab.ondblclick = () => page.reload()
	})
	pages[parseInt(storage.get('focus')) || 0].tab.click()
}

const Page = category => {
	let page = 1
	let loading = false
	let focused = false

	const sort = 'hot' // or 'new'
	const base = category.query == 'home' ? `https://toutiao.io/prev/` : `https://toutiao.io/c/${category.query}`

	const tab = createElement('div', 'tab', category.text)
	const feed = createElement('div', 'feed')

	const focus = () => {
		focused = true
		tab.classList.add('focus')
		feed.classList.add('focus')
	}

	const unfocus = () => {
		focused = false
		tab.classList.remove('focus')
		feed.classList.remove('focus')
	}

	const scrollTop = () => {
		let timer = 0
		let previous = feed.scrollTop
		const scroll = () => {
			if(feed.scrollTop == 0)
				clearTimeout(timer)
			else if(previous != feed.scrollTop)
				clearTimeout(timer)
			else{
				previous -= 40
				feed.scrollTop = previous
				timer = setTimeout(() => scroll(), 10)
			}
		}
		scroll()
	}

	const loadMore = () => {
		if(loading)
			return
		else
			loading = true

		return request(`${base}${category.query == 'home' ? date(page) : `?page=${page}&f=${sort}`}`)
		.then(body => {
			page += 1
			loading = false
			if(body != null){
				let fragment = document.createDocumentFragment()
				extract(body).forEach(item => fragment.appendChild(render(item)))
				feed.appendChild(fragment)
			}
			else{
				return loadMore()
			}
		})
		
	}

	const reload = () => {
		feed.innerHTML = ''
		page = 1
		return loadMore()
	}

	return {
		tab,
		feed,
		focus,
		unfocus,
		reload,
		loadMore,
		scrollTop,
		focused: () => focused
	}
}

const createElement = (tagName, className, innerHTML) => {
	let element = document.createElement(tagName)
	if(className) element.className = className
	if(innerHTML) element.innerHTML = innerHTML
	return element
}

const request = url => new Promise((resolve, reject) => {
	const xhr = new XMLHttpRequest()
	xhr.onreadystatechange = () => {
		if(xhr.readyState == 4){
			if(xhr.status == 200)
				resolve(xhr.responseText)
			else
				reject()
		}
	}
	xhr.open('GET', url, true)
	xhr.send()
})

const date = delta => {
	let date = new Date()
	date.setDate(date.getDate() - (delta - 1))
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const extract = html => { 
	const posts = (new DOMParser()).parseFromString(html, 'text/html').getElementsByClassName('post')
	return Array.from(posts).map(post => ({
		title: post.getElementsByClassName('title')[0].getElementsByTagName('a')[0].innerHTML,
		source: post.getElementsByClassName('meta')[0].firstChild.wholeText.trim(),
		href: 'https://toutiao.io' + post.getElementsByClassName('title')[0].getElementsByTagName('a')[0].getAttribute('href'),
		praises: post.getElementsByClassName('like-button')[0].getElementsByTagName('span')[0].innerHTML,
		comments: post.getElementsByClassName('meta')[0].getElementsByTagName('span')[0].lastChild.wholeText.trim(),
		author: {
			avatar: post.getElementsByClassName('user-avatar')[0].getElementsByTagName('img')[0].src,
			name: post.getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].innerHTML,
			href: 'https://toutiao.io' + post.getElementsByClassName('subject-name')[0].getElementsByTagName('a')[0].getAttribute('href')
		}
	}))
}

const render = content => {
	const post = createElement('div', 'post')
	post.appendChild(createElement('div', 'title', content.title))
	post.appendChild(createElement('div','source', content.source))
	const meta = post.appendChild(createElement('div', 'meta'))
	const count = meta.appendChild(createElement('div', 'count'))
	count.appendChild(createElement('div', 'praise', content.praises))
	count.appendChild(createElement('div', 'comment', content.comments))
	const user = meta.appendChild(createElement('div', 'user'))
	user.appendChild(createElement('div', 'avatar')).style.backgroundImage = `url(${content.author.avatar})`
	user.appendChild(createElement('div', 'name', content.author.name))

	post.onclick = event => {
		event.stopPropagation()
		shell.openExternal(content.href)
	}
	user.onclick = event => {
		event.stopPropagation()
		shell.openExternal(content.author.href)
	}
	return post
}

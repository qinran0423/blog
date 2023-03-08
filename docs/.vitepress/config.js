export default {
	base: '/blog/',
	title: 'Mick\'s Blog',
	description: 'Just playing around.',
	themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { 
                text: 'Mick Blog', 
                items: [
                    { text: 'Github', link: 'https://github.com/qinran0423' },
                    { text: '掘金', link: 'https://juejin.cn/user/2972688068406429/posts' }
                ]
            }
        ],
		sidebar: [
			{
				text: 'HTML',
				link: '/',
				collapsed: true,
				items: [
					{text: 'html主要题目', link: '/html/'}
				]
			},
			{
				text: 'CSS',
				link: '/css/index',
				collapsed: true,
				items: [
					{text: 'Context', link: '/css/index'},
					{text: '面试题', link: '/css/面试题'},
					{text: '布局问题', link: '/css/布局问题'}
				]
			},
			{
				text: 'JavaScript',
				link: '/js/继承',
				collapsed: true,
				items: [
					{text: '继承', link: '/js/继承'},
					{text: '手写call、apply、bind', link: '/js/手写call、apply、bind'},
					{text: '原型和原型链', link: '/js/原型和原型链'},
					{text: '执行上下文和作用域', link: '/js/执行上下文和作用域'}
				]
			},
			{
				text: 'Vue',
				link: '/vue/new vue 都干了啥？',
				collapsed: true,
				items: [
					{text: 'new vue 都干了啥？', link: '/vue/new vue 都干了啥？'},
					{text: 'vue-cli-v2解刨', link: '/vue/vue-cli-v2解刨'},
					{text: 'Vue2 双端diff算法', link: '/vue/Vue2 双端diff算法'},
					{text: 'Vue2源码中的mergeOptions', link: '/vue/Vue2源码中的mergeOptions'},
					{text: 'Vue3快速diff算法', link: '/vue/Vue3快速diff算法'}
				]
			},
			{
				text: "网络协议",
				link: '/',
				collapsed: true,
				items: [
					{text: 'HTTP协议', link: '/网络协议/HTTP协议'},
					{text: 'TCP、IP', link: '/网络协议/TCP、IP'},
					{text: 'options请求', link: '/网络协议/options请求'}
				]
			},
			{
				text: "算法",
				link: '/',
				collapsed: true,
				items: [
					{text: '二分查找', link: '/算法/二分查找'}
				]	
			},
			{
				text: 'other',
				link: '/other/create-blog',
				collapsed: true,
				items: [
					{text: '用Vitepress + Github Pages 搭建自己的个人博客', link: '/other/create-blog'},
				]
			},
		]
    }
  }
  
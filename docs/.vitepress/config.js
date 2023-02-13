export default {
	title: 'Mick\'s Blog',
	description: 'Just playing around.',
	themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { 
                text: 'Mick 博客', 
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
				items: [
					{text: 'html主要题目', link: '/html/'}
				]
			},
			{
				text: 'JavaScript',
				link: '/',
				items: [
					{text: '继承', link: '/js/继承'},
					{text: '手写call、apply、bind', link: '/js/手写call、apply、bind'},
					{text: '原型和原型链', link: '/js/原型和原型链'},
					{text: '执行上下文和作用域', link: '/js/执行上下文和作用域'}
				]
			},
			{
				text: 'Vue',
				link: '/',
				items: [
					{text: 'new vue 都干了啥？', link: '/vue/new vue 都干了啥？'},
					{text: 'vue-cli-v2解刨', link: '/vue/vue-cli-v2解刨'},
					{text: 'Vue2 双端diff算法', link: '/vue/Vue2 双端diff算法'},
					{text: 'Vue2源码中的mergeOptions', link: '/vue/Vue2源码中的mergeOptions'},
					{text: 'Vue3快速diff算法', link: '/vue/Vue3快速diff算法'}
				]
			},

		]
    }
  }
  
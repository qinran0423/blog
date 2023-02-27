# HTTP协议
HTTP协议用于客户端和服务端之间的通信。HTTP协议规定，请求从客户端发出，最后服务器响应请求并返回。

## 无状态协议
HTTP是一种不保存状态，即无状态协议。HTTP协议自身不对请求和响应之间的通信状态进行保存。也就是说HTTP这个级别，协议对于发送过的请求或响应都不做持久化处理。

HTTP/1.1虽然是无状态协议，但是为了实现期望的保持状态功能，引入了Cookie。

## HTTP方法
- GET：获取资源
- POST：传输实体主体
- PUT：传输文件
- HEAD：获取报文首部
- DELETE：删除文件
- OPTIONS：询问支持方法

## 持久连接节省通信量
HTTP协议的初始版本，每进行一次HTTP通信都要端来一次TCP连接。

比如：使用浏览器浏览一个包含多张图片的HTML页面时，在发送请求访问HTML页面资源的同时，也会请求该HTML页面里包含的其他资源。因为，每次的请求都会造成无谓的TCP连接建立和断开，增加通信量的开销。

### 持久连接
HTTP keep-alive

持久连接的好处在于减少了TCP连接的重复建立和断开造成的额外开销，减轻了服务器端的负载。减少开销的那部分时间，使HTTP请求和响应能够更早的结束，这样web页面的显示速度也就相应的提高的。

## Cookie的状态管理
Cookie技术通过在请求和响应报文中写入Cookie信息来控制客户端的状态

Cookie根据从服务端发送的响应报文内的Set-Cookie的首部字段信息，通知客户端保存Cookie。下次客户端再往服务器发送请求的时候，客户端会自动在请求报文中加入Cookie值发送出去

## HTTP状态码
- 1xx —— 接收的请求正在处理
- 2xx —— 请求正常处理完毕
- 3xx —— 需要进行附加操作以完成请求
- 4xx —— 服务器无法处理请求
- 5xx —— 服务器处理请求出错

### 2xx 成功
**200 OK** - 表示从客户端发来的请求在服务器端被正常处理了
**204 No Content** - 表示服务器接收的请求已经成功处理，但是在返回的响应报文中不含实体的主体部分，另外也不允许返回任何实体的主体
**206 Partial Content** - 表示客户端进行了范围请求，而服务器成功执行了这部分的GET请求。响应报文中包含由Content-Range指定范围的实体内容


## 请求首部字段
- Accept —— 通知服务器，用户代理能够处理的媒体类型及媒体类型的相对优先级
  - 文本文件 —— text/html, text/plain, text/css, application/xhtml+xml, application/wml
  - 图片文件 —— image/jpeg, image/gif, image/png
  - 视频文件 —— video/mpeg, video/quicktime
  - 应用程序使用的二进制文件 —— application/octet-stream, application/zip

- Accept-Charest —— 用来通知服务器用户代理支持的字符集及字符集的相对优先顺序

- Accept-Encoding —— 用来告知服务器用户代理支持的内容编码以及内容编码的优先顺序
  - gzip —— 由文件压缩程序gzip生成的编码格式
  - compress —— 由UNIX 文件压缩程序compress 生成的编码格式
  - deflate —— 组合使用zlib以及deflate压缩算法生成的编码格式
  - identitiy —— 不执行压缩或不会变化的默认编码格式

- Accept-language —— 用来告知服务器用户代理能够处理的自然语言集, 以及自然语言集的相对优先级

- Authorization —— 告知服务器，用户代理的认证信息。

- Expect —— 期望出现的某种特定行为。因服务器无法理解客户端的期望作出回应而发生错误时，会返回状态码417

- From —— 使用用户代理的用户的电子邮件地址

— Host —— 请求的资源所处的互联网主机名和端口号。 Host 首部字段在HTTP/1.1规范内是唯一一个必须被包含在请求内的内部字段

- If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since —— If-xxx 这种样式的请求首部字段，称为条件请求。
	- If-Match —— 告知服务器匹配资源所用的实例标记（ETag）值。
	- If-Modified-Since ——  告知服务器若If-Modified-Since字段值早于资源的更新时间，则希望能处理请求，而在指定If-Modified-Since字段值的日期时间之后，如果请求的资源都没有更新，则返回状态码304。 If-Modified-Since 用于确认代理或客户端拥有的本地资源的有效性
	- If-None-Match —— 用于执行 If-None-Match 字段值的实体标记（ETag）值与请求资源的ETag不一致时，它就告知服务器处理该请求
	- If-Range —— 告知服务器若指定的If-Range字段值（ETag值或时间）和请求资源的ETag值或时间相一致时，则作为范围请求处理。反之，则返回全体资源
	- If-Unmodified-Since —— 指定的请求资源只有在字段值内指定的日期时间之后, 未发生更新的情况下，才能处理请求。

- Range —— 对于只需要获取部分资源的范围请求，包含首部字段Range即可告知服务器资源的指定范围。
- Referer —— 请求原始资源的URL
- User-Agent —— 会将创建请求的浏览器和用户代理名称等信息传达给服务器。







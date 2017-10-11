Shadow Bootstrap 用户手册
-----------------------------

-----

&nbsp;

[Bootstrap](https://github.com/twbs/bootstrap) 是广受欢迎的 HTML、CSS 和 JS 框架，用于开发响应式布局、移动设备优先的 WEB 项目。[Shadow Widget](https://github.com/rewgt/shadow-server) 是一种可视化控件框架，它基于 react 技术，将 JSX 及虚拟 DOM 封装成一种易用、易继承、易管理的形式，让界面设计与业务逻辑获得良好分离，从而支持所见即所得（WYSIWYG）的开发模式。

[Shadow Bootstrap](https://github.com/rewgt/shadow-bootstrap) 是 Bootstrap v3 在 Shadow Widget 框架的适配库，由 Shadow Widget 团队承担主体开发，并在 github.com 网站以 BSD 协议开源。

#### 安装 Shadow Bootstrap

先安装 Shadow Widget：

``` bash
  mkdir user
  cd user
  git clone https://github.com/rewgt/shadow-server.git
```

然后安装 Shadow Bootstrap：

``` bash
  git clone https://github.com/rewgt/shadow-bootstrap.git
```

#### 在本机启动 Web 服务

``` bash
  cd shadow-server
  npm install
  npm start
```

运行后，请在 Web 浏览器访问 `http://localhost:3000/shadow-bootstrap/output/doc/doc_zh/`，看看是否正常打开 shadow-bootstrap 的用户手册。经 shadow-bootstrap 封装的构件，绝大部分在这本手册可在线演示。

#### 版权

Copyright 2017, PINP.ME Development Group. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  - Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
  - Neither the name of PINP.ME nor the names of its contributors 
    may be used to endorse or promote products derived from this 
    software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

&nbsp;

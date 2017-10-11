// bootstrap.js

var React = require('react');
var ReactDOM = require('react-dom');
var W = require('shadow-widget');

var T = W.$templates, creator = W.$creator;
var utils = W.$utils, ex = W.$ex, main = W.$main, idSetter = W.$idSetter;

//--------
function htmlEncode(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function boolToStr(b) {
  return b? '1': '';
}

function safeContent(s) { // safe get char such as: &larr; &rarr;
  return s || '';         // no transfer, using utf-8 or '\u2190 \u2192'
/*
  if (!s) return '';
  var node = document.createElement('p');
  try {
    node.innerHTML = s;
    return node.textContent;
  }
  catch(e) {
    return '';
  } */
}

function nodeContains(node,child) {
  if (!node) return false;
  
  if (node.contains)
    return node.contains(child);
  else if (node.compareDocumentPosition)
    return node === child || !!(node.compareDocumentPosition(child) & 16);
  else {
    var tmp = child;
    while (tmp) {
      if (tmp === node)
        return true;
      tmp = tmp.parentNode;
    }
    return false;
  }
}

function activeNodeOfDoc() {
  try {
    return document.activeElement;
  }
  catch(e) {}  // maybe error in IE
}

function nodeRect_(node) {
  return node.getBoundingClientRect();
}

function nodeSetAttr_(node,attr,value) {
  node.setAttribute(attr,value);
}

function absoluteCorner_() {
  var wdgt = creator.topmostWidget_, rootComp = wdgt && wdgt.component;
  var rootNode = rootComp && rootComp.getHtmlNode();
  if (rootNode) {
    var r = nodeRect_(rootNode);
    return [r.left,r.top];
  }
  else return [0,0];
}

var size_map_ = { large:'lg', medium:'md', small:'sm', xsmall:'xs' };

function getSizeKlass_(sPrefix,sSize) {
  if (sSize) {
    sSize = size_map_[sSize] || '';
    if (sSize)
      return sPrefix+'-'+sSize;
  }
  return '';
}

function ownerAbsolute_(self) {
  var owner = self.widget, isAbsolute = false;
  owner = owner && owner.parent;
  if (owner) {
    if (owner.parent === W)  // owner is .body
      isAbsolute = true;
    else {
      var ownerComp = owner.component;
      if (ownerComp && ownerComp.state.style.position == 'absolute')
        isAbsolute = true;
    }
  }
  return isAbsolute;
}

var bs_control_idx_ = 0;

function newControlId_() {
  return '_for' + (++bs_control_idx_);  // ctrl1,ctrl2 ...
}

//-----------
var BS = T.bs = {};

var jsVoid_ = 'javascript:void(0)';
var boolPropmpt_ = ['','1'];

var div_margin_   = [null,null,null,null];
var div_padding_  = [null,null,null,null];
var div_borderwd_ = [null,null,null,null];

var children2Arr_ = React.Children.toArray;

var bsDocUrl_ = '/app/rewgt/shadow-bootstrap/web/output/doc';

function hasChildNode_(children) {
  if (!children || typeof children == 'string') return false;
  return children2Arr_(children).length > 0;
}

function makeBsClass_(TBase,sName) {
  var sName2 = sName.toLowerCase();
  
  class T extends TBase {
    constructor(name,desc) {
      super(name || 'bs.' + sName,desc);
      this._docUrl = bsDocUrl_;
      Object.assign(this._defaultProp, { bsClass:sName2,
        left:null, top:null, width:null, height:null, minWidth:0, minHeight:0,
        margin:div_margin_.slice(0),
        padding:div_padding_.slice(0),
        borderWidth:div_borderwd_.slice(0),
      });
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      return Object.assign(props, { bsClass:sName2, 'childInline.':true,
        width:null, height:null, left:null, top:null, minWidth:0, minHeight:0,
        margin:div_margin_.slice(0),
        padding:div_padding_.slice(0),
        borderWidth:div_borderwd_.slice(0),
      });
    }
  }
  
  return T;
}

( function(b) {
  b.forEach( function(sName) {
    var Klass = makeBsClass_(T[sName+'_'],sName);
    BS[sName+'_'] = Klass;
    BS[sName] = new Klass();
  });
})(['Div2','NavDiv','GroundDiv','MarkedDiv','MarkedTable']);

function makeBsClass2_(TBase,sName) {
  var sName2 = sName.toLowerCase();
  class T extends TBase {
    constructor(name,desc) {
      super(name || ('bs.'+sName),desc);
      this._docUrl = bsDocUrl_;
      this._defaultProp.bsClass = sName2;
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      props.bsClass = props['tagName.'] = sName2;
      return props;
    }
  }
  
  return T;
}

function makeBsClass3_(TBase,sName,sCls,isInline,sRole) {
  class T extends TBase {
    constructor(name,desc) {
      super(name || ('bs.'+sName),desc);
      this._docUrl = bsDocUrl_;
      this._defaultProp.bsClass = sCls;
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      props.bsClass = sCls;
      props.className = isInline? (W.__design__?'rewgt-inline '+sCls:sCls): 'rewgt-unit ' + sCls;
      if (sRole) props.role = sRole;
      return props;
    }
  }
  
  return T;
}

( function(b) {
  b.forEach( function(sName) {
    var Klass = makeBsClass2_(BS.Div2_,sName);
    BS[sName+'_'] = Klass;
    BS[sName] = new Klass();
  });
})([ 'P','H1','H2','H3','H4','H5','H6','Hr','Pre','Hgroup',
  'Ul','Ol','Li','Dl','Dd','Dt','Iframe','Noscript',
  'Fieldset','Details','Figure','Figcaption','Menu','Menuitem','Address',
  'Caption','Colgroup','Td','Tbody','Thead','Tfoot','Th','Tr',
]); // next will define: bs.Form, bs.Blockquote, bs.Table

var form_klass_ = { 'form-horizontal':true, 'form-inline':true };

class TForm_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || ('bs.Form'),desc);
    this._defaultProp.bsClass = 'form';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.inline = [iLevel+1,'string',boolPropmpt_];
    dSchema.horizontal = [iLevel+2,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = props['tagName.'] = 'form';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['inline','horizontal'],renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,form_klass_,
        this.state.inline && 'form-inline',
        this.state.horizontal && 'form-horizontal',
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Form_ = TForm_;
BS.Form  = new TForm_();

var blockquote_klass_ = { blockquote:true, 'blockquote-reverse':true };

class TBlockquote_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || ('bs.Blockquote'),desc);
    this._defaultProp.bsClass = 'blockquote';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.reverse = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = props['tagName.'] = 'blockquote';
    props.reverse = '';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('reverse',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,blockquote_klass_,
        this.state.reverse? 'blockquote-reverse': 'blockquote'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Blockquote_ = TBlockquote_;
BS.Blockquote  = new TBlockquote_();

var A__    = T.A._createClass(null);    // null means get cached class
var Img__  = T.Img._createClass(null);
var Span__ = T.Span._createClass(null);
var OptA__ = T.OptA._createClass(null);

var BsUl__ = BS.Ul._createClass(null);
var BsMarkedDiv__ = BS.MarkedDiv._createClass(null);

//----------
var btn_klass_ = { 'btn-block':true, 'btn-lg':true, 'btn-md':true, 'btn-sm':true,
  'btn-xs':true, 'btn-default':true, 'btn-success':true,
  'btn-warning':true, 'btn-danger':true, 'btn-info':true,
  'btn-primary':true, 'btn-link':true, active:true,
};

function itemSpaceFn_(value,oldValue) {
  var i = parseInt(value);
  if (!isNaN(i)) {
    var px = i + 'px';
    this.duals.style = {marginLeft:px, marginRight:px};
  }
}

function MakeBtnCls(TBase,btnName) {
  class TBtn_ extends TBase {
    constructor(name,desc) {
      super(name || 'bs.' + btnName,desc);
      this._docUrl = bsDocUrl_;
      if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
      Object.assign(this._defaultProp, { bsClass:'btn',
        block:'', type:'button', disabled:'', bsStyle:'default',
      });
    }
    
    _getSchema(self,iLevel) {
      iLevel = iLevel || 1200;
      var dSchema = super._getSchema(self,iLevel + 200);
      
      dSchema.bsStyle = [iLevel+1,'string',['default','success','warning','danger','info','primary','link']];
      dSchema.bsSize = [iLevel+2,'string',['','large','medium','small','xsmall']];
      dSchema.type = [iLevel+3,'string',['button','reset','submit']];
      dSchema.block = [iLevel+4,'string',boolPropmpt_];
      dSchema.disabled = [iLevel+5,'string',boolPropmpt_];
      dSchema['data-checked'] = [iLevel+6,'string',boolPropmpt_];
      dSchema.icon = [iLevel+7,'string'];
      dSchema.glyph = [iLevel+8,'string'];
      dSchema.itemSpace = [iLevel+9,'number'];
      return dSchema;
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      if (W.__design__) props['data-html.opt'] = 'edit';
      return Object.assign(props, { block:'',
        disabled:'', type:'button',
        className:'btn', bsClass:'btn', bsStyle:'default',
      });
    }
    
    getInitialState() {
      var state = super.getInitialState();
      
      this.defineDual(['icon','glyph'])  // make duals.icon, duals.glyph ready
          .defineDual('role',null,'button');
      this.defineDual(['bsSize','bsStyle','data-checked','block'],renewKlass);
      this.defineDual('itemSpace',itemSpaceFn_);
      this.defineDual('href', function(value,oldValue) {
        if (!this.props.bsStyle)  // auto assign bsStyle only when no props.bsStyle
          this.duals.bsStyle = value? 'link': 'default';
      });
      
      this.defineDual('id__', function(value,oldValue) {
        if (value <= 2) return;
        if (hasChildNode_(this.props.children)) return; // no need setChildren
        
        this.state['tagName.'] = (this.state.bsStyle == 'link')? 'a': 'button';
        
        var bChild, sIcon = this.state.icon, glyph = this.state.glyph;
        var sTitle = safeContent(this.state['html.']);
        var bChild = [ <span key='txt'>{sTitle}</span> ];
        if (sIcon)
          bChild.unshift( <img key='img' style={{position:'relative',top:'-2px'}} src={sIcon}/> );
        else if (glyph)
          bChild.unshift( <span key='img' className={'glyphicon glyphicon-' + glyph}/> );
        utils.setChildren(this,bChild);
      });
      
      if (this.props['isOption.']) {
        var self = this;
        this.listen('data-checked', function(value,oldValue) {
          if (!value) return;
          setTimeout( function() {
            if (self.state.recheckable)
              self.duals['data-checked'] = ''; // auto reset data-checked when recheckable
          },400);
        });
      }
      
      return state;
      
      function renewKlass(value,oldValue) {
        var sSize = getSizeKlass_('btn',this.state.bsSize);
        var sCls = utils.setupKlass( this.state.klass,btn_klass_,
          'btn-' + (this.state.bsStyle || 'default'), sSize,
          this.state.block && 'btn-block',
          this.state['data-checked'] && 'active'
        );
        this.duals.klass = sCls;
      }
    }
    
    $$onClick(event) {
      if (W.__design__)
        event.preventDefault();      // avoid click jump linker
      
      if (this.props['isOption.']) { // run super $$onClick(event)
        if (this.state.disabled) return;
        this.setChecked(null);
      }
      if (this.$onClick) this.$onClick(event);
    }
  }
  
  return TBtn_;
}

BS.Btn_ = MakeBtnCls(T.Button_,'Btn');
BS.Btn  = new BS.Btn_();

var BsBtn__ = BS.Btn._createClass(null);

BS.OptBtn_ = MakeBtnCls(T.OptButton_,'OptBtn');
BS.OptBtn  = new BS.OptBtn_();

var menuitem_klass_ = { active:true, disabled:true, divider:true, 'dropdown-header':true };

class TMenuItem_ extends BS.Li_ {
  constructor(name,desc) {
    super(name || 'bs.MenuItem',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    Object.assign(this._defaultProp, { bsClass:'menuitem',
      role:'presentation', disabled:'',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.divider = [iLevel+1,'string',boolPropmpt_];
    dSchema.disabled = [iLevel+2,'string',boolPropmpt_];
    dSchema['data-checked'] = [iLevel+3,'string',boolPropmpt_];
    dSchema.header  = [iLevel+4,'string',boolPropmpt_];
    dSchema.href    = [iLevel+5,'string'];
    dSchema.icon    = [iLevel+6,'string'];
    dSchema.glyph   = [iLevel+7,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { bsClass:'menuitem',
      role:'presentation', disabled:'',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('role')
        .defineDual(['disabled','data-checked'],renewKlass);
    this.defineDual('header', function(value,oldValue) {
      this.duals.role = 'heading';
      renewKlass.call(this); // padding:[3,20,3,20]
    });
    this.defineDual('divider', function(value,oldValue) {
      this.duals.role = 'separator';
      renewKlass.call(this); // margin:[9,0,9,0] height:1
    });
    
    this.defineDual(['icon','glyph']);   // make duals.icon duals.glyph available
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (this.state.divider || this.state.header) return;   // no children
      
      var sSrc = this.state.href || jsVoid_;
      var LnkClass, attrs = { key:'a', role:'menuitem',
        tabIndex:'-1', href:sSrc,
      };
      if (this.state.disabled)
        attrs.style = {pointerEvents:'none'};
      if (this.isOpt_) {
        LnkClass = OptA__;
        // attrs['data-checked'] = '';  // always clickable
      }
      else LnkClass = A__;
      
      var jsx, sIcon = this.state.icon, glyph = this.state.glyph;
      var sTitle = safeContent(this.state['html.']);
      if (sIcon)
        jsx = <LnkClass {...attrs}><Img__ src={sIcon} key='img' style={{position:'relative',top:'-2px'}}/><Span__ key='tit'>{sTitle}</Span__></LnkClass> ;
      else if (glyph)
        jsx = <LnkClass {...attrs}><Span__ key='img' klass={'glyphicon glyphicon-'+glyph}/><Span__ key='tit'>{sTitle}</Span__></LnkClass> ;
      else jsx = <LnkClass {...attrs}>{sTitle}</LnkClass> ;
      utils.setChildren(this,[jsx]);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = '';
      if (this.state.divider)
        sCls = 'divider';
      else {
        sCls = utils.klassNames( this.state.header && 'dropdown-header',
          this.state['data-checked'] && 'active',
          this.state.disabled && 'disabled'
        );
      }
      
      sCls = utils.setupKlass( this.state.klass,menuitem_klass_,sCls );
      this.duals.klass = sCls;
    }
  }
}

BS.MenuItem_ = TMenuItem_;
BS.MenuItem  = new TMenuItem_();

class TOptItem_ extends TMenuItem_ {
  constructor(name,desc) {
    super(name || 'bs.OptItem',desc);
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.isOpt_ = true;
    return state;
  }
}

BS.OptItem_ = TOptItem_;
BS.OptItem  = new TOptItem_();

var menulist_klass_ = { 'dropdown-menu':true, open:true };

function onMenuClick_(event) {
  event.stopPropagation();
  
  var sMenuCls = 'dropdown-menu', sSrc = '', sKey = '', node = null;
  var topNode = this.getHtmlNode(), targ = event.target;
  while (targ) {
    if (targ === topNode || targ === document.body) break;
    if (targ.classList.contains(sMenuCls)) {
      node = targ;
      break;
    }
    else if (targ.nodeName == 'A') {
      sSrc = targ.href;
      sKey = utils.keyOfNode(targ);
    }
    targ = targ.parentNode;
  }
  if (!node) return;
  
  if (W.__design__ || !sSrc || this.state.disabled) // for most browser, should not fire event if state.disabled 
    event.preventDefault();         // avoid <a> jumping
  
  var doSelect = false, fn = this.props.onSelect || this.onSelect;
  if (typeof fn == 'function') {
    fn.call(this,sKey,event);
    doSelect = true;
  }
  if (doSelect || this.state.disabled)
    event.stopPropagation();
}

idSetter['.rewgt.bt.MenuList.menu'] = function(value,oldValue) {
  if (value == 1) {
    var owner = this.parentOf(true);
    this.setEvent( { $onClick: onMenuClick_.bind(owner) } );
  }
};

class TMenuList_ extends BS.MarkedDiv_ {
  constructor(name,desc) {
    super(name || 'bs.MenuList',desc);
    Object.assign(this._defaultProp, { bsClass:'dropdown-menu',
      noShow:'1',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.open = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { 'childInline.':true,
      className:'rewgt-unit noselect-txt',
      bsClass:'dropdown-menu', noShow:'1',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('open');
    this.defineDual('id__', function(value,oldValue) {
      if (oldValue == 1) {
        var sPosCss, isAbsolute = ownerAbsolute_(this);
        if (isAbsolute)
          sPosCss = 'absolute';
        else sPosCss = this.state.style.position || 'relative';  // if not specified, assign 'relative'
        if (sPosCss == 'absolute')
          this.duals.style = {position:sPosCss};
        else this.duals.style = {position:sPosCss, clear:'left'};
      }
      if (value <= 2) return;
      
      var isOpen = this.state.open;
      var sCls = utils.setupKlass( this.state.klass,menulist_klass_,'dropdown-menu',isOpen && 'open' );
      var dStyle = {display:isOpen?'block':'none'};
      
      var bMenu = this.state.nodes.map( function(item) {
        return item[1];
      });
      
      utils.setChildren(this,[
        <BsUl__ key='menu' klass={sCls} role='menu' style={dStyle} $id__='.rewgt.bt.MenuList.menu'>
          {bMenu}
        </BsUl__>
      ]);
    });
    
    if (this.props.open || this.props.defaultOpen)
      this.duals.open = '1';
    return state;
  }
}

BS.MenuList_ = TMenuList_;
BS.MenuList  = new TMenuList_();

var btngroup_klass_ = { 'btn-group-lg':true, 'btn-group-md':true, 'btn-group-sm':true,
  'btn-group-xs':true, 'btn-group':true, 'btn-group-vertical':true,
};

class TBtnGroup_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.BtnGroup',desc);
    Object.assign(this._defaultProp, { bsClass:'btn-group',
      justified:'', vertical:'',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.bsSize = [iLevel+1,'string',['','large','medium','small','xsmall']];
    dSchema.justified = [iLevel+2,'string',boolPropmpt_];
    dSchema.vertical = [iLevel+3,'string',boolPropmpt_];
    dSchema.itemSpace = [iLevel+4,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, {
      justified:'', vertical:'', bsClass:'btn-group',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['bsSize','vertical'],renewKlass);
    
    this.defineDual('itemSpace', function(value,oldValue) {
      var i = parseInt(value);
      if (!isNaN(i)) {
        var bMrg = this.state.margin.slice(0);
        bMrg[1] = bMrg[3] = i;
        this.duals.margin = bMrg;
      }
    });
    
    this.defineDual('justified', function(value,oldValue) {
      var self = this, isJustify = !!value, isVertical = this.state.vertical;
      
      setTimeout( function() {
        var sPer, b = utils.eachComponent(self), iLen = b.length;
        if (iLen == 0 || iLen > 100) return;
        if (isVertical || !isJustify)
          sPer = '';
        else sPer = (Math.floor(1000 / iLen) / 10) + '%'; // 50% 33.3% ...
        
        b.forEach( function(child) {
          child.duals.style = {width:sPer};
        });
      },0);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sSize = getSizeKlass_('btn-group',this.state.bsSize);
      var sMainCls = this.state.vertical? 'btn-group-vertical': 'btn-group';
      var sCls = utils.setupKlass( this.state.klass,btngroup_klass_,
        sMainCls, sSize,
      );
      this.duals.klass = sCls;
    }
  }
}

BS.BtnGroup_ = TBtnGroup_;
BS.BtnGroup  = new TBtnGroup_();

idSetter['.rewgt.bt.DropdownBtn.btn'] = function(value,oldValue) {
  if (value == 1) {
    var owner = this.parentOf(true);
    this.setEvent( {
      $onClick: onToggleClick.bind(owner),
      $onKeyDown: onToggleKeyDown.bind(owner),
    });
  }
  
  function onToggleClick(event) {
    event.stopPropagation();
    if (this.state.disabled) return;
    
    var toOpen = !this.state.open, self = this;
    if (toOpen) {
      self.noClickClose_ = true;
      setTimeout( function() {
        self.noClickClose_ = false;
      },1000);
    }
    this.toggleOpen_(event,{source:'click'});
    setTimeout( function() {
      if (toOpen) {
        var menuComp = self.componentOf('menu');
        var menuNode = menuComp && menuComp.getHtmlNode();
        if (menuNode) {
          var node = menuNode.querySelector('li.active > [tabindex="-1"]');
          if (node) node.focus();  // if no active item, ignore focus
        }
      }
      else self.focus();
    },300);
  }
  
  function onToggleKeyDown(event) {
    event.stopPropagation();
    
    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
    if (this.state.disabled) return;
    
    var code = event.keyCode, toOpen = !this.state.open;
    if (code == 40) {  // down
      this.lastKeyPress_ = (new Date()).valueOf();
      if (toOpen) {
        this.toggleOpen_(event,{source:'keydown'});
        this.focusMenuNext_();
      }
      event.preventDefault();
    }
    else if (code == 27 || code == 9) {  // esc or tab
      if (!toOpen)
        this.toggleOpen_(event,{source:'keydown'});
    }
  }
};

idSetter['.rewgt.bt.DropdownBtn.menu'] = function(value,oldValue) {
  if (value == 1) {
    var owner = this.parentOf(true);
    
    this.setEvent( {
      $onClick: ( function(event) {
        onMenuClick_.call(this,event);
        if (this.state.open)
          this.toggleOpen_(event,{source:'select'});
      }).bind(owner),
      
      $onKeyDown: ( function(event) {
        event.stopPropagation();
        if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
        
        var code = event.keyCode;
        if (code == 40 || code == 38) {
          event.preventDefault();
          this.lastKeyPress_ = (new Date()).valueOf();
          if (code == 40)             // down
            this.focusMenuNext_();
          else this.focusMenuPrev_(); // up
        }
        else if (code == 27 || code == 9) { // esc or tab
          if (this.state.open)
            this.toggleOpen_(event,{source:'keydown'}); // close it
        }
      }).bind(owner),
    });
  }
};

var dropbtn_klass_  = { dropdown:true, dropup:true, 'btn-group':true,
  'btn-group-default':true, 'btn-group-success':true, 'btn-group-warning':true,
  'btn-group-danger':true, 'btn-group-info':true, 'btn-group-primary':true,
  'btn-group-link':true, open:true, disabled:true, active:true,
  'input-group-btn':true,
};

class TDropdownBtn_ extends BS.MarkedDiv_ {
  constructor(name,desc) {
    super(name || 'bs.DropdownBtn',desc);
    this._statedProp.push('data-checked');
    Object.assign(this._defaultProp, { bsClass:'dropdown',
      'data-checked':'',
      bsStyle:'default', disabled:'', noShow:'1',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.bsStyle  = [iLevel+1,'string',['default','success','warning','danger','info','primary','link']];
    dSchema.bsSize   = [iLevel+2,'string',['','large','medium','small','xsmall']];
    dSchema.desc     = [iLevel+3,'string'];
    dSchema.disabled = [iLevel+4,'string',boolPropmpt_];
    dSchema.dropup   = [iLevel+5,'string',boolPropmpt_];
    dSchema.noCaret  = [iLevel+6,'string',boolPropmpt_];
    dSchema.open = [iLevel+7,'string',boolPropmpt_];
    dSchema.pullRight = [iLevel+8,'string',boolPropmpt_];
    dSchema['data-checked'] = [iLevel+9,'string',boolPropmpt_]; // used under bs.Nav
    dSchema.itemSpace = [iLevel+10,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { 'childInline.':true,
      className:'rewgt-unit noselect-txt', 'data-checked':'',
      bsClass:'dropdown', disabled:'', bsStyle:'default', noShow:'1',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.lastKeyPress_ = 0;  // time of key press
    this.noClickClose_ = false;
    this.inInputGroup_ = false;
    
    var ownerComp = this.parentOf(true); // true means ignore virtual node
    if (ownerComp) {
      var ownerCls = ownerComp.props.bsClass;
      if (ownerCls == 'input-group') {
        this.inInputGroup_ = true;
        this.$gui.className = W.__design__? 'rewgt-inline': '';
        state['tagName.'] = 'span';
      }
      else if (ownerCls == 'nav') {
        state['tagName.'] = 'li';
        state.role = 'presentation';
        state.inNav_ = '1';
        
        var noSelect = this.props.noSelect;
        if (noSelect === undefined && (ownerComp=ownerComp.parentOf(true))) {
          var sOwnCls = ownerComp.props.bsClass;
          if (sOwnCls === 'navbar' || sOwnCls === 'navbar-collapse')
            noSelect = true; // if under bs.Navbar, default take props.noSelect as true
        }
        
        var segComp = this.componentOf('./');
        if (segComp) {
          var self = this;
          segComp.listen('checkedId', function(value,oldValue) {
            var subComp = self.componentOf('menu');
            if (subComp) {
              var keys = {};
              utils.eachComponent(subComp, function(child) {
                keys[child.duals.keyid] = true;
              });
              var b = boolToStr(keys[value]);
              self.duals['data-checked'] = b;
              
              if (b && noSelect) {
                setTimeout( function() {
                  self.duals['data-checked'] = '';  // auto clear select
                },300);
              }
            }
          });
        }
      }
    }
    
    this.defineDual('role');
    this.defineDual('itemSpace', function(value,oldValue) {
      var i = parseInt(value);
      if (!isNaN(i)) {
        var bMrg = this.state.margin.slice(0);
        bMrg[1] = bMrg[3] = i;
        this.duals.margin = bMrg;
      }
    });
    
    state.disabled = '';
    this.defineDual('desc',null,'')
        .defineDual(['bsSize','noCaret','pullRight'])
        .defineDual(['bsStyle','disabled','dropup','open','data-checked'],renewKlass);
    
    var thisComp = this;
    this.listen('open', function(value,oldValue) {
      if (!value) {
        var menuNode = thisComp.componentOf('menu');
        menuNode = menuNode && menuNode.getHtmlNode();
        if (nodeContains(menuNode,activeNodeOfDoc()))
          thisComp.focus();
      }
    });
    this.listen('disabled', function(value,oldValue) {
      if (thisComp.duals.open) { // auto close menu when disabled
        var evt = document.createEvent('Event');
        thisComp.toggleOpen_(evt,{source:'disabled'});
      }
    });
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var inNav      = this.state.inNav_ || '';
      var inSplitBtn = !this.inInputGroup_ && !inNav && this.isSplitBtn_; // if inNav, fix inSplitBtn to false
      
      var bsStyle    = this.state.bsStyle || 'default';
      var bsSize     = this.state.bsSize || '';
      var sTitle     = safeContent(this.state.desc);
      var noCaret    = this.state.noCaret;
      var disabled   = this.state.disabled || '';
      var caretStyle = {
        display: 'inline block',
        visibility: (noCaret? 'hidden': 'visible'),
        marginLeft: (noCaret || inSplitBtn? '0px': '4px'),
      };
      
      var bMenu = this.state.nodes.map( function(item) {
        return item[1];
      });
      
      var sClsName = inNav? 'dropdown-toggle': (inSplitBtn? 'btn': 'btn dropdown-toggle');
      var BtnClass = inNav? A__: BsBtn__;
      var sMenuCls = utils.klassNames('dropdown-menu',this.state.pullRight?'dropdown-menu-right':'');
      
      var bChild;
      if (inSplitBtn) {
        bChild = [
          <BsBtn__ key='btn0' className={sClsName} bsSize={bsSize} bsStyle={bsStyle} disabled={disabled}>
            <span key='title'>{sTitle}</span>
          </BsBtn__> ,
          <BsBtn__ key='btn' className={'dropdown-toggle btn ' + bsStyle} bsSize={bsSize} bsStyle={bsStyle} disabled={disabled} $id__='.rewgt.bt.DropdownBtn.btn'>
            <span key='caret' className='caret' style={caretStyle} />
          </BsBtn__> ,
          <BsUl__ key='menu' klass={sMenuCls} role='menu' borderWidth={1} padding={0} $id__='.rewgt.bt.DropdownBtn.menu'>
            {bMenu}
          </BsUl__>
        ];
      }
      else {
        bChild = [
          <BtnClass key='btn' className={sClsName} bsSize={bsSize} bsStyle={bsStyle} disabled={disabled} $id__='.rewgt.bt.DropdownBtn.btn'>
            <span key='title'>{sTitle}</span>
            <span key='caret' className='caret' style={caretStyle} />
          </BtnClass> ,
          <BsUl__ key='menu' klass={sMenuCls} role='menu' borderWidth={1} padding={0} $id__='.rewgt.bt.DropdownBtn.menu'>
            {bMenu}
          </BsUl__>
        ];
      }
      utils.setChildren(this,bChild);
    });
    
    this.duals.open = boolToStr(this.props.open);  // call renewKlass() and try focus
    return state;
    
    function renewKlass(value,oldValue) {
      var bsStyle, bsGroup;
      if (this.inInputGroup_) {
        bsStyle = '';
        bsGroup = 'input-group-btn';
      }
      else {
        bsStyle = 'btn-group-' + this.state.bsStyle;
        bsGroup = !this.state.inNav_ && 'btn-group';
      }
      
      var sDropUpDn = this.state.dropup? 'dropup': 'dropdown';
      var sCls = utils.setupKlass( this.state.klass,dropbtn_klass_,
        bsStyle, bsGroup, sDropUpDn,
        this.state.disabled && 'disabled',
        this.state.open && 'open',
        this.state['data-checked'] && 'active'
      );
      this.duals.klass = sCls;
    }
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    document.addEventListener('click',this.handleClose_,false);
    if (this.props.defaultOpen && !this.state.open)
      this.toggleOpen_();
  }
  
  componentWillUnmount() {
    document.removeEventListener('click',this.handleClose_);
    super.componentWillUnmount();
  }
  
  handleClose_(event) {
    if (this.state.open && !this.noClickClose_)
      this.toggleOpen_(event,{source:'rootClose'}); // close it
  }
  
  toggleOpen_(event,eventDetails) {
    var toOpen = !this.state.open;
    
    if (event && eventDetails) {
      var fn = this.props.onToggle || this.onToggle;
      if (typeof fn == 'function')
        fn.call(this,toOpen,event,eventDetails);
    }
    
    this.duals.open = boolToStr(toOpen);
  }
  
  focus() {
    var btnComp = this.componentOf('btn');
    setTimeout( function() {
      var node = btnComp && btnComp.getHtmlNode();
      if (node && node.focus)
        node.focus();
    },0);
  }
  
  focusMenuNext_() {
    var menuComp = this.componentOf('menu');
    if (menuComp && ((new Date()).valueOf() - this.lastKeyPress_) < 1000) {
      this.lastKeyPress_ = 0;
      
      setTimeout( function() {
        var node = menuComp.getHtmlNode();
        if (node) {
          var b = Array.from(node.querySelectorAll('[tabindex="-1"]'));
          if (b.length === 0) return;
          
          var actived = document.activeElement, activeIdx = b.indexOf(actived);
          var nextIdx = activeIdx == b.length-1? 0: activeIdx + 1; // activeIdx = -1  --> 0
          b[nextIdx].focus();
        }
      },0);
    }
  }
  
  focusMenuPrev_() {
    var menuComp = this.componentOf('menu');
    if (menuComp && ((new Date()).valueOf() - this.lastKeyPress_) < 1000) {
      this.lastKeyPress_ = 0;
      
      setTimeout( function() {
        var node = menuComp.getHtmlNode();
        if (node) {
          var b = Array.from(node.querySelectorAll('[tabindex="-1"]'));
          if (b.length === 0) return;
          
          var actived = document.activeElement, activeIdx = b.indexOf(actived);
          var prevIdx = activeIdx <= 0? b.length-1: activeIdx - 1;
          b[prevIdx].focus();
        }
      },0);
    }
  }
}

BS.DropdownBtn_ = TDropdownBtn_;
BS.DropdownBtn  = new TDropdownBtn_();

class TSplitBtn_ extends TDropdownBtn_ {
  constructor(name,desc) {
    super(name || 'bs.SplitBtn',desc);
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.isSplitBtn_ = true;
    return state;
  }
}

BS.SplitBtn_ = TSplitBtn_;
BS.SplitBtn  = new TSplitBtn_();

BS.BtnToolbar_ = makeBsClass3_(BS.Div2_,'BtnToolbar','btn-toolbar',false,'toolbar');
BS.BtnToolbar  = new BS.BtnToolbar_();

var modaldialog_style_ = {backgroundColor:'rgba(0,0,0,0.3)'};

class TModalDialog_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.ModalDialog',desc);
    Object.assign(this._defaultProp, { bsClass:'modal', showModal:'', hasClose:'1',
      role:'dialog', tabIndex:'-1', style:Object.assign({},modaldialog_style_),
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.dialogWidth = [iLevel+1,'any',null,'[any]: "large/small", css string, or number (0~0.9999 or pixels)'];
    dSchema.showModal = [iLevel+2,'string',boolPropmpt_];
    dSchema.manualClose = [iLevel+3,'string',boolPropmpt_];
    dSchema.canEsc = [iLevel+4,'string',boolPropmpt_];
    dSchema.hasClose = [iLevel+5,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'modal', showModal:'', hasClose:'1',
      className:'rewgt-unit modal', role:'dialog', tabIndex:'-1',
      style:Object.assign({},modaldialog_style_),
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['dialogWidth','manualClose','canEsc','hasClose'])
        .defineDual('showModal', function(value,oldValue) {
      this.duals.style = {display:value?'block':'none'};
    });
    
    this.ignoreEvent_ = ( function(event) {
      event.stopPropagation();
    }).bind(this);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var noEvent = this.ignoreEvent_;
      var props = { onClick:noEvent, onDoubleClick:noEvent,
        onMouseDown:noEvent, onMouseMove:noEvent, onMouseUp:noEvent,
        onKeyPress:noEvent, onKeyDown:noEvent, onKeyUp:noEvent,
        onDragOver:noEvent, onDrop:noEvent,
      };
      
      var wd = null, sCls = 'modal-dialog', dStyle = {};
      var width = this.state.dialogWidth, tp = typeof width;
      if (tp == 'number') {
        if (width >= 1)
          wd = width + 'px';
        else if (width >= 0.9999)
          wd = '100%';
        else if (wd >= 0)
          wd = (wd * 100) + '%';
      }
      else if (tp == 'string' && width) {
        if (width == 'large' || width == 'small')
          sCls = 'modal-dialog ' + getSizeKlass_('modal',width);
        else wd = width;
      }
      if (wd !== null) {
        dStyle.width = wd;
        props.style = dStyle;
      }
      if (W.__design__) {
        dStyle.marginTop = '120px';
        props.style = dStyle;
      }
      props.className = sCls;
      
      utils.setChildren( this, null,
        <div {...props}>
          <div className='modal-content' role='document'/>
        </div> );
    });
    
    return state;
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    this.escPress_ = ( function(event) {
      if (this.state.canEsc && event.keyCode == 27)
        this.duals.showModal = '';
    }).bind(this);
    document.addEventListener('keypress',this.escPress_,false);
  }
  
  componentWillUnmount() {
    document.removeEventListener('keypress',this.escPress_);
    this.escPress_ = null;
    
    super.componentWillUnmount();
  }
  
  $$onClick(event) {
    if (!this.state.manualClose)
      this.duals.showModal = '';
    if (this.$onClick) this.$onClick(event);
  }
}

BS.ModalDialog_ = TModalDialog_;
BS.ModalDialog  = new TModalDialog_();

class TModalHeader_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.ModalHeader',desc);
    this._defaultProp.bsClass = 'modal-header';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.desc = [iLevel+1,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'modal-header';
    props.className = 'rewgt-unit modal-header';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.closeClick_ = ( function(event) {
      var owner = this.parentOf(true);
      if (owner && owner.props.bsClass === 'modal')
        owner.duals.showModal = '';
    }).bind(this);
    
    this.defineDual(['desc','hasClose']);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (hasChildNode_(this.props.children)) return;
      
      var jsx = [], sTitle = safeContent(this.state.desc);
      if (this.state.hasClose)
        jsx.push( <button key='btn' className='close' type='button' onClick={this.closeClick_}>x</button> );
      jsx.push( <h4 key='tit' className='modal-title'>{sTitle}</h4> );
      utils.setChildren(this,jsx);
    });
    
    return state;
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    var owner = this.parentOf(true);
    if (owner && owner.props.bsClass === 'modal') {
      owner.listen('hasClose',this,'hasClose');
      this.duals.hasClose = owner.state.hasClose;
    }
  }
}

BS.ModalHeader_ = TModalHeader_;
BS.ModalHeader  = new TModalHeader_();

BS.ModalTitle_ = makeBsClass3_(BS.H4_,'ModalTitle','modal-title');
BS.ModalTitle  = new BS.ModalTitle_();

BS.ModalBody_ = makeBsClass3_(BS.Div2_,'ModalBody','modal-body');
BS.ModalBody  = new BS.ModalBody_();

BS.ModalFooter_ = makeBsClass3_(BS.Div2_,'ModalFooter','modal-footer');
BS.ModalFooter  = new BS.ModalFooter_();

var tooltip_offset_ = [0,0,0,2];
var tooltip_klass_  = { 'in':true, tooltip:true,
  top:true, right:true, bottom:true, left:true,
};

var arrow_pos_hint_   = '[number]: 0.5 means 50%';
var side_offset_hint_ = '[array]: [iTop,iRight,iBottom,iLeft] of side gap';

class TTooltip_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Tooltip',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    Object.assign(this._defaultProp, { bsClass:'tooltip',
      offset:tooltip_offset_.slice(0),
      placement:'right',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.placement = [iLevel+1,'string',['top','right','bottom','left']];
    dSchema.arrowPosition = [iLevel+2,'number',null,arrow_pos_hint_];
    dSchema.offset = [iLevel+3,'array',null,side_offset_hint_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { left:0, top:0,
      offset:tooltip_offset_.slice(0),
      placement:'right', bsClass:'tooltip',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('placement', function(value,oldValue) {
      if (value == 'top' || value == 'bottom')
        this.duals.padding = [5,0,5,0];
      else this.duals.padding = [0,5,0,5];  // left or right
      renewKlass.call(this);
    });
    
    this.defineDual('arrowPosition', function(value,oldValue) {
      this.state.arrowPosition = parseFloat(value);
    });
    
    this.defineDual('id__', function(value,oldValue) {
      if (oldValue == 1) {
        var isAbsolute = ownerAbsolute_(this);
        if (isAbsolute)
          this.duals.style = { position:'absolute', display:'block' };
        else {
          var sPosCss = this.state.style.position || 'relative';   // if not specified, assign 'relative'
          this.duals.style = { position: sPosCss,
            display: (sPosCss=='relative'?'inline-block':'block'), // visibility:hidden for initial hide
          };
        }
      }
      if (value <= 2) return;
      
      var placement = this.state.placement || 'right';
      var arrStyle, arrPos = this.state.arrowPosition;
      if (isNaN(arrPos)) arrPos = 0.5;
      arrPos = (Math.max(0,Math.min(1,arrPos)) * 100) + '%';
      if (placement == 'top' || placement == 'bottom')
        arrStyle = {left: arrPos};
      else arrStyle = {top: arrPos};
      
      var sTitle = safeContent(this.state['html.']);
      utils.setChildren(this, [
        <div className='tooltip-arrow' style={arrStyle}></div> ,
        <div className='tooltip-inner'>{sTitle}</div>
      ]);
    });
    
    function renewKlass(value,oldValue) {
      var sDirect = this.state.placement || 'right';
      var sCls = utils.setupKlass( this.state.klass,tooltip_klass_,'in tooltip',sDirect);
      this.duals.klass = sCls;
    }
    
    return state;
  }
}

BS.Tooltip_ = TTooltip_;
BS.Tooltip  = new TTooltip_();

var popover_offset_ = [10,10,10,10];
var popover_klass_  = {'in':true, popover:true,
  top:true, right:true, bottom:true, left:true,
};

idSetter['.rewgt.bt.Popover.ctx'] = function(value,oldValue) { // only in __design__
  if (value == 1) {
    this.defineDual('id__', function(value,oldValue) { // not trigger duals['html.'] when design
      if (!this.isHooked) return;
      
      var sMark = this.state['html.'];
      if (typeof sMark == 'string') {
        var owner = this.parentOf(true);
        if (owner)
          owner.state['html.'] = sMark; // keep same and not trigger duals['html.']
      }
    });
  }
};

class TPopover_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Popover',desc);
    Object.assign(this._defaultProp, { bsClass:'popover', 
      placement:'right', role:'tooltip', offset:popover_offset_.slice(0),
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.placement = [iLevel+1,'string',['top','right','bottom','left']];
    dSchema.desc = [iLevel+2,'string'];
    dSchema.arrowPosition = [iLevel+3,'number',null,arrow_pos_hint_];
    dSchema.offset = [iLevel+4,'array',null,side_offset_hint_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'popover',
      placement:'right', role:'tooltip', offset:popover_offset_.slice(0),
      'isPre.':true, left:0, top:0,
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('desc');
    this.defineDual('placement',renewKlass);
    this.defineDual('arrowPosition', function(value,oldValue) {
      this.state.arrowPosition = parseFloat(value);
    });
    
    this.defineDual('id__', function(value,oldValue) {
      if (oldValue == 1) {
        var sPosCss, isAbsolute = ownerAbsolute_(this);
        if (isAbsolute)
          sPosCss = 'absolute';
        else sPosCss = this.state.style.position || 'relative';  // if not specified, assign 'relative'
        this.duals.style = {position:sPosCss, display:'block'};  // visibility:hidden for initial hide
      }
      if (value <= 2) return;
      
      var placement = this.state.placement || 'right';
      var arrStyle, arrPos = this.state.arrowPosition;
      if (isNaN(arrPos)) arrPos = 0.5;
      arrPos = (Math.max(0,Math.min(1,arrPos)) * 100) + '%';
      if (placement == 'top' || placement == 'bottom')
        arrStyle = {left: arrPos};
      else arrStyle = {top: arrPos};
      
      var sTitle = safeContent(this.state.desc), sHtml = this.state['html.'] || '';
      var markProp = {key:'ctx',klass:'popover-content'};
      if (W.__design__) markProp['$id__'] = '.rewgt.bt.Popover.ctx';
      utils.setChildren(this, [
        <div key='arr' className='arrow' style={arrStyle}></div> ,
        <h3 key='tit' className='popover-title'>{sTitle}</h3> ,
        <BsMarkedDiv__ {...markProp}>{sHtml}</BsMarkedDiv__>
      ]);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sDirect = this.state.placement || 'right';
      var sCls = utils.setupKlass( this.state.klass,popover_klass_,'in popover',sDirect);
      this.duals.klass = sCls;
    }
  }
}

BS.Popover_ = TPopover_;
BS.Popover  = new TPopover_();

var design_offset_x_ = 40, design_offset_y_ = 116;

class TOverlayTrigger_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.OverlayTrigger',desc);
    Object.assign(this._defaultProp, { bsClass:'overlay-trigger',
      placement:'right', fireBy:'hover,focus',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.placement = [iLevel+1,'string',['top','right','bottom','left']];
    dSchema.desc = [iLevel+2,'string'];
    dSchema.path = [iLevel+3,'string',null,'[string]: path of overlay component'];
    dSchema.arrowPosition = [iLevel+4,'number',null,arrow_pos_hint_];
    dSchema.delay = [iLevel+5,'number',null,'[number]: millisecond delay amount'];
    dSchema.fireBy = [iLevel+6,'string',null,'[string]: any of "hover,focus,click"'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props,{ bsClass:'overlay-trigger',
      placement:'right', fireBy:'hover,focus',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.waitHideId = 0;
    
    this.defineDual('path');
    this.defineDual('arrowPosition', function(value,oldValue) {
      this.state.arrowPosition = parseFloat(value);
    });
    
    this.defineDual('delay', function(value,oldValue) { // if undefined or 0, means not auto close
      var i = parseInt(value) || 0;
      if (i < 0) i = Number.MAX_SAFE_INTEGER;  // means waiting forever
      this.state.delay = i;
    });
    
    this.defineDual('desc').defineDual('placement').defineDual('fireBy');
    
    state['tagName.'] = '';
    return state;
  }
  
  componentWillUnmount() {
    if (this.waitHideId) {
      clearTimeout(this.waitHideId);
      this.waitHideId = 0;
    }
    super.componentWillUnmount();
  }
  
  enterOverlay_(isHover,isFocus,isCall,offX,offY) {
    var node = this.getHtmlNode();
    if (!node) return;
    
    var iAutoHide = this.state.delay || 0;
    if (isHover) this.byHover = true;
    if (isFocus) this.byFocus = true;
    if (isCall) this.byCall = true;
    if (this.overlayNode) {
      if (iAutoHide) waitingClose(self,iAutoHide);
      return;
    }
    
    var placement = this.state.placement;
    var iLeft, iTop, rect = nodeRect_(node), bLeftTop = absoluteCorner_();
    if (placement == 'right' || placement == 'left') {
      iLeft = rect.left + (isNaN(offX)?0:offX);
      if (placement == 'right') iLeft += rect.width;
      iTop = rect.top + (rect.height/2) + (isNaN(offY)?0:offY);
    }
    else { // top, bottom
      iLeft = rect.left + (rect.width/2) + (isNaN(offX)?0:offX);
      iTop = rect.top + (isNaN(offY)?0:offY);
      if (placement == 'bottom') iTop += rect.height;
    }
    iLeft -= bLeftTop[0];
    iTop -= bLeftTop[1];
    
    if (W.__design__) {
      iLeft += design_offset_x_;
      iTop += design_offset_y_;
    }
    
    var sRefPath = this.state.path, sDesc = this.state.desc || '';
    var arrPos = this.state.arrowPosition;
    if (isNaN(arrPos)) arrPos = 0.5;
    arrPos = Math.max(0,Math.min(1,arrPos));
    
    if (sDesc) { 
      var overlay = this.overlayNode = newOverlayNode(node,placement,sDesc,arrPos,iLeft,iTop);
      this.refByPath = false;
      
      document.body.appendChild(overlay);
      setTimeout( function(self) {
        var r = nodeRect_(overlay);
        if (placement == 'top' || placement == 'bottom') {
          overlay.style.marginLeft = '-' + (r.width / 2) + 'px';
          if (placement == 'top')
            overlay.style.marginTop = '-' + r.height + 'px';
        }
        else { // left or right
          overlay.style.marginTop = '-' + (r.height / 2) + 'px';
          if (placement == 'left')
            overlay.style.marginLeft = '-' + (r.width+2) + 'px';
        }
        
        var fn = self.props.onEnter || self.onEnter;
        if (typeof fn == 'function')
          fn.call(self);
        
        if (iAutoHide) waitingClose(self,iAutoHide);
      },0,this);
    }
    else if (sRefPath) {
      var targComp = this.componentOf(sRefPath);
      if (!targComp) return;
      
      this.overlayNode = targComp;
      this.refByPath = true;
      
      targComp.duals.style = {display:'block', visibility:'hidden', position:'absolute'};
      
      var self = this;
      targComp.reRender( function() {
        var targNode = targComp.getHtmlNode();
        if (!targNode) return;
        
        var offset = targComp.props.offset || [0,0,0,0];
        var r = nodeRect_(targNode);
        if (placement == 'top' || placement == 'bottom') {
          iLeft -= (r.width / 2);
          if (placement == 'top')
            iTop -= (r.height + (offset[2] || 0));
          else iTop += (offset[0] || 0);
        }
        else {
          iTop -= (r.height / 2);
          if (placement == 'left')
            iLeft -= (r.width + (offset[1] || 0));
          else iLeft += (offset[3] || 0);
        }
        
        targComp.duals.left = iLeft;
        targComp.duals.top = iTop;
        targComp.duals.style = {visibility:'visible'};
        
        var fn = self.props.onEnter || self.onEnter;
        if (typeof fn == 'function')
          fn.call(self);
        
        if (iAutoHide) waitingClose(self,iAutoHide);
      });
    }
    // else, ignore
    
    function waitingClose(self,iWait) {
      if (self.waitHideId) clearTimeout(self.waitHideId);
      self.waitHideId = setTimeout( function() {
        self.waitHideId = 0;
        self.hideOverlay();
      },iWait);
    }
    
    function newOverlayNode(node,placement,sDesc,arrPos,iLeft,iTop) {
      var overlay = document.createElement('div'), rect = nodeRect_(node);
      
      nodeSetAttr_(overlay,'role','tooltip');
      overlay.className = 'in tooltip ' + placement;
      overlay.style.left = iLeft + 'px';
      overlay.style.top = iTop + 'px';
      
      var arrowNode = document.createElement('div'), sArrPos = (arrPos * 100) + '%';
      arrowNode.className = 'tooltip-arrow';
      if (placement == 'top' || placement == 'bottom')
        arrowNode.style.left = sArrPos;
      else arrowNode.style.top = sArrPos;
      overlay.appendChild(arrowNode);
      
      var descNode = document.createElement('div');
      descNode.className = 'tooltip-inner';
      descNode.innerHTML = htmlEncode(sDesc);
      overlay.appendChild(descNode);
      
      return overlay;
    }
  }
  
  exitOverlay_() {
    var overlay = this.overlayNode;
    if (overlay && (!this.byHover && !this.byFocus && !this.byCall)) {
      if (this.waitHideId) {
        clearTimeout(this.waitHideId);
        this.waitHideId = 0;
      }
      
      this.overlayNode = null;
      setTimeout( function(self) {
        if (self.refByPath)
          overlay.duals.style = {visibility:'hidden'};
        else {
          var owner = overlay.parentNode;
          if (owner) owner.removeChild(overlay);
        }
        
        var fn = self.props.onExit || self.onExit;
        if (typeof fn == 'function')
          fn.call(self);
      },0,this);
    }
  }
  
  showOverlay(offX,offY) {
    this.enterOverlay_(false,false,true,offX,offY);  // by call
  }
  
  hideOverlay() {  // force exit
    this.byHover = this.byFocus = this.byCall = false;
    this.exitOverlay_();
  }
  
  inShow() {
    return !!this.overlayNode;
  }
  
  $$onClick(event) { // if re-define $onClick, props.fireBy should be ''
    var sFireBy = this.state.fireBy;
    if (sFireBy.indexOf('click') >= 0) {
      if (this.overlayNode)
        this.hideOverlay();
      else this.enterOverlay_(false,false,true); // by call, not using offX,offY
    }
    
    if (this.$onClick) this.$onClick(event);
  }
  
  $$onMouseOver(event) {
    var sFireBy = this.state.fireBy;
    if (sFireBy.indexOf('hover') >= 0)
      this.enterOverlay_(true,false,false);
    
    if (this.$onMouseOver) this.$onMouseOver(event);
  }
  
  $$onMouseOut(event) {
    var sFireBy = this.state.fireBy;
    if (sFireBy.indexOf('hover') >= 0) {
      this.byHover = false;
      this.exitOverlay_();
    }
    
    if (this.$onMouseOut) this.$onMouseOut(event);
  }
  
  $$onFocus(event) {
    var sFireBy = this.state.fireBy;
    if (sFireBy.indexOf('focus') >= 0)
      this.enterOverlay_(false,true,false);
    
    if (this.$onFocus) this.$onFocus(event);
  }
  
  $$onBlur(event) {
    var sFireBy = this.state.fireBy;
    if (sFireBy.indexOf('focus') >= 0) {
      this.byFocus = false;
      this.exitOverlay_();
    }
    
    if (this.$onBlur) this.$onBlur(event);
  }
}

BS.OverlayTrigger_ = TOverlayTrigger_;
BS.OverlayTrigger  = new TOverlayTrigger_();

var navitem_klass_  = { active:true, disabled:true, dropdown:true };

class TNavItem_ extends T.OptLi_ {
  constructor(name,desc) {
    super(name || 'bs.NavItem',desc);
    this._docUrl = bsDocUrl_;
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    Object.assign(this._defaultProp, { bsClass:'navitem',
      left:null, top:null, minWidth:0, minHeight:0,
      margin: div_margin_.slice(0),      // css default is [0,0,-1,0]
      padding: div_padding_.slice(0),
      borderWidth: div_borderwd_.slice(0),
      role:'presentation', disabled:'',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.disabled = [iLevel+1,'string',boolPropmpt_];
    dSchema['data-checked'] = [iLevel+2,'string',boolPropmpt_];
    dSchema.href = [iLevel+3,'string'];
    dSchema.icon = [iLevel+4,'string'];
    dSchema.glyph = [iLevel+5,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { bsClass:'navitem',role:'presentation',
      left:null, top:null, minWidth:0, minHeight:0,
      margin: div_margin_.slice(0),        // css default is [0,0,-1,0]
      padding: div_padding_.slice(0),
      borderWidth: div_borderwd_.slice(0),
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['disabled','data-checked'],renewKlass);
    
    var ownerObj = this.parentOf(true);
    if (ownerObj && ownerObj.props.bsClass == 'nav') {  // NavItem should only used under Nav
      var noSelect = this.props.noSelect;
      if (noSelect === undefined && (ownerObj=ownerObj.parentOf(true))) {
        var sOwnCls = ownerObj.props.bsClass;
        if (sOwnCls === 'navbar' || sOwnCls === 'navbar-collapse')
          noSelect = true; // if under bs.Navbar, default take props.noSelect as true
      }
      if (noSelect) {
        var self = this;
        this.listen('data-checked', function(value,oldValue) {
          if (value) {
            setTimeout( function() {
              self.duals['data-checked'] = '';
            },300);
          }
        });
      }
    }
    
    this.defineDual(['icon','glyph']);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sKey = this.duals.keyid + ''; // let child use same key
      var sSrc = this.state.href || jsVoid_;
      var sHtml  = safeContent(this.state['html.']);
      var jsx, sIcon = this.state.icon, glyph = this.state.glyph;
      var props = { key:sKey, role:'button',
        tabIndex:'-1', href:sSrc, style:{outline:'0'}, // outline:0 to avoid focus frame
      };
      if (this.state.disabled) props.style = {pointerEvents:'none'};
      if (sIcon)
        jsx = <a {...props}><img src={sIcon} style={{position:'relative',top:'-2px'}}/>{sHtml}</a> ;
      else if (glyph)
        jsx = <a {...props}><span className={'glyphicon glyphicon-' + glyph}/>{sHtml}</a> ;
      else jsx = <a {...props}>{sHtml}</a> ;
      utils.setChildren(this,[jsx]);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,navitem_klass_,
        this.state['data-checked'] && 'active',
        this.state.disabled && 'disabled'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.NavItem_ = TNavItem_;
BS.NavItem  = new TNavItem_();

var nav_klass_ = { nav:true, 'nav-pills':true, 'nav-tabs':true,
  'nav-stacked':true, 'nav-justified':true,
  'navbar-nav':true, 'navbar-right':true, 'navbar-left':true,
};

class TNav_ extends BS.Ul_ {
  constructor(name,desc) {
    super(name || 'bs.Nav',desc);
    Object.assign(this._defaultProp, { bsClass:'nav', bsStyle:'pills' });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.bsStyle   = [iLevel+1,'string',['pills','tabs']];
    dSchema.justified = [iLevel+2,'string',boolPropmpt_];
    dSchema.stacked   = [iLevel+3,'string',boolPropmpt_];
    dSchema.pullRight = [iLevel+4,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'nav', bsStyle:'pills' });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    // no onSelect, pls listen NavXX.duals.checkedId
    var ownerObj = this.parentOf(true);
    if (ownerObj) {
      var sOwnCls = ownerObj.props.bsClass;
      if (sOwnCls === 'navbar' || sOwnCls === 'navbar-collapse')
        state.inNavBar_ = '1';
    }
    
    this.defineDual(['bsStyle','justified','stacked','pullRight'],renewKlass);
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sPrefix, sAlign = '', sJustitied = '', sStacked = '';
      if (this.state.inNavBar_) {
        sPrefix = 'nav navbar-nav';
        sAlign = this.state.pullRight && 'navbar-right';
      }
      else {
        sPrefix = 'nav nav-' + this.state.bsStyle;  // bsStyle must defined
        sJustitied = this.state.justified && 'nav-justified';
        sStacked = this.state.stacked && 'nav-stacked';
      }
      
      var sCls = utils.setupKlass( this.state.klass,nav_klass_,sPrefix,sJustitied,sAlign,sStacked);
      this.duals.klass = sCls;
    }
  }
}

BS.Nav_ = TNav_;
BS.Nav  = new TNav_();

var navbar_klass_  = { navbar:true, 'navbar-default':true, 'navbar-inverse':true,
  'navbar-fixed-top':true, 'navbar-fixed-bottom':true, 'navbar-static-top':true,
};

class TNavbar_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Navbar',desc);
    this._statedProp = ['height','left','top'];  // no 'width'
    Object.assign(this._defaultProp, { bsClass:'navbar',
      bsStyle:'default',
    });
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'navbar', 'tagName.':'nav',
      bsStyle:'default',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.bsStyle   = [iLevel+1,'string',['default','inverse']];
    dSchema.fluid     = [iLevel+2,'string',boolPropmpt_];
    dSchema.fixedTop  = [iLevel+3,'string',boolPropmpt_];
    dSchema.fixedBottom = [iLevel+4,'string',boolPropmpt_];
    dSchema.staticTop = [iLevel+5,'string',boolPropmpt_];
    return dSchema;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    var useOwnerWd = false;
    if (this.props.width === null) { // try change to '100%' when under panel
      var ownerComp = this.parentOf(true);
      if (ownerComp && utils.hasClass(ownerComp,'rewgt-panel')) {
        this.duals.width = 0.9999;
        useOwnerWd = true;
      }
    }
    
    this.defineDual('fluid');
    this.defineDual(['bsStyle','fixedTop','fixedBottom','staticTop'],renewKlass);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sCls = this.state.fluid?'container-fluid':'container';
      var bsWidth = null;
      if (useOwnerWd) {
        if (W.__design__)
          bsWidth = '100%';
      }
      else {
        bsWidth = this.state.width;
        if (bsWidth !== null && !isNaN(bsWidth) && bsWidth >= 1)
          bsWidth = bsWidth + 'px';
      }
      
      var jsx;
      if (bsWidth === null)
        jsx = <div key='ctx' className={sCls} /> ;
      else jsx = <div key='ctx' className={sCls} style={{width:bsWidth}} /> ;
      utils.setChildren(this,null,jsx);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sStyle = 'navbar-' + this.state.bsStyle;  // bsStyle must be defined
      var sWhere = '';
      if (!W.__design__) {
        if (this.state.fixedTop)
          sWhere = 'navbar-fixed-top';
        else if (this.state.fixedBottom)
          sWhere = 'navbar-fixed-bottom';
      }
      var sStatic = this.state.staticTop && 'navbar-static-top';
      
      var sCls = utils.setupKlass( this.state.klass,navbar_klass_,'navbar',sStyle,sWhere,sStatic);
      this.duals.klass = sCls;
    }
  }
}

BS.Navbar_ = TNavbar_;
BS.Navbar  = new TNavbar_();

BS.NavbarHeader_ = makeBsClass3_(BS.Div2_,'NavbarHeader','navbar-header');
BS.NavbarHeader  = new BS.NavbarHeader_();

class TNavbarForm_ extends BS.Form_ {
  constructor(name,desc) {
    super(name || ('bs.NavbarForm'),desc);
    this._defaultProp.bsClass = 'navbar-form';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.pullRight = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'navbar-form';
    props.className = 'rewgt-unit navbar-form';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('pullRight',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,['navbar-right'],
        this.state.pullRight && 'navbar-right'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.NavbarForm_ = TNavbarForm_;
BS.NavbarForm  = new TNavbarForm_();

class TNavbarToggle_ extends T.Button_ {
  constructor(name,desc) {
    super(name || 'bs.NavbarToggle',desc);
    this._docUrl = bsDocUrl_;
    Object.assign(this._defaultProp, { bsClass:'navbar-toggle',
      type:'button',
    });
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'navbar-toggle',
      type:'button', className:'navbar-toggle',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      utils.setChildren(this, [
        <span key='b1' className='icon-bar'/> ,
			  <span key='b2' className='icon-bar'/> ,
			  <span key='b3' className='icon-bar'/>
			]);
    });
    
    return state;
  }
  
  findCollapse_() {
    var ownerComp = this.parentOf(true);
    if (ownerComp) {
      var sCls = ownerComp.props.bsClass;
      if (sCls === 'navbar-header') {
        ownerComp = ownerComp.parentOf(true);
        if (ownerComp && ownerComp.props.bsClass !== 'navbar')
          ownerComp = null;
      }
      else if (sCls !== 'navbar')
        ownerComp = null;
    }
    
    var collaComp = null;
    if (ownerComp) {
      utils.eachComponent(ownerComp, function(comp) {
        if (comp.props.role === 'collapsible')
          collaComp = comp;
      });
    }
    return collaComp;
  }
  
  $$onClick(event) {
    var collaComp = this.findCollapse_();
    if (collaComp)
      collaComp.duals.expanded = boolToStr(!collaComp.state.expanded);
    
    if (this.$onClick) this.$onClick(event);
  }  
}

BS.NavbarToggle_ = TNavbarToggle_;
BS.NavbarToggle  = new TNavbarToggle_();

class TFade_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Fade',desc);
    Object.assign(this._defaultProp, { bsClass:'fade',
      expanded:'',
    });
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { className:'rewgt-unit fade',
      bsClass:'fade', expanded:'',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('expanded',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,['in'],
        this.state.expanded && 'in'
      );
      this.duals.klass = sCls;
    }
  }
  
  componentDidMount() {
    super.componentDidMount();
    if (this.props.defaultExpanded && !this.state.expanded)
      this.duals.expanded = '1';
  }
}

BS.Fade_ = TFade_;
BS.Fade  = new TFade_();

class TCollapse_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Collapse',desc);
    Object.assign(this._defaultProp, { bsClass:'collapse',
      expanded:'', role:'collapsible',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.animation = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { className:'rewgt-unit collapse',
      bsClass:'collapse', expanded:'', role:'collapsible',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('animation');
    this.defineDual('expanded',renewKlass);
    
    return state;
    
    function renewKlass(value,oldValue) {
      var b = ['in','collapsing'], collapseCls = this.props.collapseClass;
      if (collapseCls) b.push(collapseCls);
      
      var sExpanded = this.state.expanded && 'in';
      var sNewCls = utils.setupKlass(this.state.klass,b,collapseCls,sExpanded);
      var node, toOpen = false, toClose = false;
      if (this.state.animation && (node = this.getHtmlNode())) {
        toOpen = sExpanded && !utils.containKlass(this.state.klass,'in');
        toClose = !sExpanded && utils.containKlass(this.state.klass,'in');
      }
      
      this.duals.klass = utils.klassNames( sNewCls,
        toClose && 'in',        // keep showing
        (toOpen || toClose) && 'collapsing'  // apply collapsing.height = 0
      );
      
      if (toOpen) {
        var oldHi = this.state.height, isPx = !isNaN(oldHi) && oldHi >= 1;
        if (isPx) this.duals.height = null;
        setTimeout( function(self) {
          node.style.height = isPx? oldHi + 'px': '100px';
          setTimeout( function() {
            node.style.height = '';
            if (isPx) self.duals.height = oldHi;
            self.duals.klass = sNewCls;   // remove 'collapsing'
          },300);
        },100,this);
      }
      if (toClose) {
        var oldHi = this.state.height;
        if (oldHi === null) node.style.height = node.clientHeight + 'px';
        
        setTimeout( function(self) {
          node.style.height = '';
          setTimeout( function() {
            self.state.height = 0;
            self.duals.height = oldHi;
            self.duals.klass = sNewCls;  // remove 'in collapsing'
          },300);
        },100,this);
      }
    }
  }
  
  componentDidMount() {
    super.componentDidMount();
    if (this.props.defaultExpanded && !this.state.expanded)
      this.duals.expanded = '1';
  }
}

BS.Collapse_ = TCollapse_;
BS.Collapse  = new TCollapse_();

function MakeCollapseCls(sName,sCls) {
  class T extends BS.Collapse_ {
    constructor(name,desc) {
      super(name || ('bs.'+sName),desc);
      this._defaultProp.bsClass = sCls;
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      props.collapseClass = props.bsClass = sCls;
      return props;
    }
  }
  
  return T;
}

BS.NavbarCollapse_ = MakeCollapseCls('NavbarCollapse','navbar-collapse');
BS.NavbarCollapse  = new BS.NavbarCollapse_();

class TNavbarBrand_ extends T.A_ {
  constructor(name,desc) {
    super(name || 'bs.NavbarBrand',desc);
    this._docUrl = bsDocUrl_;
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    this._defaultProp.bsClass = 'navbar-brand';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.icon = [iLevel+1,'string'];
    dSchema.glyph = [iLevel+2,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    props.bsClass = 'navbar-brand';
    props.className = 'navbar-brand';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['icon','glyph']);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (hasChildNode_(this.props.children)) return;  // no need setChildren
      
      var jsx, sIcon = this.state.icon, glyph = this.state.glyph;
      var sTitle = safeContent(this.state['html.']);
      if (sIcon)
        jsx = <img key='txt' src={sIcon}/> ;
      else if (glyph)
        jsx = <span key='txt' className={'glyphicon glyphicon-' + glyph}/> ;
      else jsx = <span key='txt'>{sTitle}</span> ;
      utils.setChildren(this,[jsx]); // render text-linker or brand-icon
    });
    
    return state;
  }
}

BS.NavbarBrand_ = TNavbarBrand_;
BS.NavbarBrand  = new TNavbarBrand_();

var navbartext_klass_  = {pullRight:true};

class TNavbarText_ extends BS.P_ {
  constructor(name,desc) {
    super(name || 'bs.NavbarText',desc);
    this._defaultProp.bsClass = 'navbar-text';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.pullRight = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'navbar-text',
      className:'rewgt-unit navbar-text',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('pullRight',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sAlign = this.state.pullRight && 'navbar-right';
      var sCls = utils.setupKlass( this.state.klass,navbartext_klass_,sAlign );
      this.duals.klass = sCls;
    }
  }
}

BS.NavbarText_ = TNavbarText_;
BS.NavbarText  = new TNavbarText_();

BS.NavbarLink_ = makeBsClass3_(T.A_,'NavbarLink','navbar-link',true);
BS.NavbarLink  = new BS.NavbarLink_();

BS.Breadcrumb_ = makeBsClass3_(BS.Ol_,'Breadcrumb','breadcrumb',false,'navigation');
BS.Breadcrumb  = new BS.Breadcrumb_();

var breaditem_klass_ = {active:true};

class TBreadItem_ extends BS.Li_ {
  constructor(name,desc) {
    super(name || 'bs.BreadItem',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    this._defaultProp.bsClass = 'breadcrumb-item';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.active = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    props.bsClass = 'breadcrumb-item';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('active',renewKlass);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sSrc = this.state.href || jsVoid_;
      var jsx, sDesc = safeContent(this.state['html.']);
      if (this.state.active)
        jsx = <span key='txt'>{sDesc}</span> ;
      else jsx = <a key='txt' href={sSrc}>{sDesc}</a> ;
      utils.setChildren(this,[jsx]);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sActive = this.state.active && 'active';
      var sCls = utils.setupKlass( this.state.klass,breaditem_klass_,sActive );
      this.duals.klass = sCls;
    }
  }
}

BS.BreadItem_ = TBreadItem_;
BS.BreadItem  = new TBreadItem_();

var pagination_klass_ = { pagination:true, 'pagination-lg':true,
  'pagination-md':true, 'pagination-sm':true, 'pagination-xs':true,
};

class TPagination_ extends BS.Ul_ {
  constructor(name,desc) {
    super(name || 'bs.Pagination',desc);
    Object.assign(this._defaultProp, { bsClass:'pagination',
      activePage:1, maxButtons:0, ellipsis:'1',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.bsSize = [iLevel+1,'string',['','large','medium','small','xsmall']];
    dSchema.activePage = [iLevel+2,'number'];
    dSchema.maxButtons = [iLevel+3,'number'];
    dSchema.items = [iLevel+4,'number'];
    dSchema.first = [iLevel+5,'string',boolPropmpt_];
    dSchema.prev  = [iLevel+6,'string',boolPropmpt_];
    dSchema.next  = [iLevel+7,'string',boolPropmpt_];
    dSchema.last  = [iLevel+8,'string',boolPropmpt_];
    dSchema.ellipsis = [iLevel+9,'string',boolPropmpt_];
    dSchema.boundary = [iLevel+10,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'pagination',
      activePage:1, maxButtons:0, ellipsis:'1',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('bsSize',renewKlass)
        .defineDual(['items','maxButtons','activePage','ellipsis','boundary','first','last','prev','next']);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var itemNum = parseInt(this.state.items) || 1;
      var activePage = parseInt(this.state.activePage) || 1;
      activePage = Math.max(1,Math.min(itemNum,activePage));  // fix to: 1 ~ itemNum
      var maxButtons = parseInt(this.state.maxButtons) || 0;  // 0, 3,4 ...
      if (maxButtons == 1 || maxButtons == 2) maxButtons = 3; // ensure: iHalf >= 1
      if (maxButtons >= itemNum) maxButtons = 0; // no need use maxButtons
      var ellipsis = (maxButtons > 0) && this.state.ellipsis;
      var boundary = ellipsis && this.state.boundary;
      
      var iStart = 1, iEnd = itemNum, hasPreE = false, hasPostE = false;
      if (ellipsis) { // assert(maxButtons > 0)
        var iHalf = Math.floor((maxButtons-1)/2);
        if (activePage - iHalf > 2) {
          hasPreE = true;
          iStart = Math.min(activePage - iHalf,itemNum-maxButtons+1);
        }
        if (activePage + iHalf < itemNum-1) {
          hasPostE = true;
          iEnd = Math.max(activePage + iHalf,iStart+maxButtons-1);
        }
      }
      else {
        if (maxButtons) {
          var iHalf = Math.floor((maxButtons-1)/2);
          iStart = Math.max(1,activePage - iHalf);
          iEnd = Math.min(iStart + maxButtons - 1,itemNum);
        }
        // else, list all buttons
      }
      
      var bItem = [];
      if (this.state.first)
        bItem.push(makePageItem('first','«',false,activePage == 1));
      if (this.state.prev)
        bItem.push(makePageItem('prev','‹',false,activePage == 1));
      
      if (hasPreE) {
        if (boundary)
          bItem.push(makePageItem('b1','1',false,false));
        bItem.push(makePageItem('pre','…',false,true));
      }
      
      for (var i=iStart; i <= iEnd; i++) {
        bItem.push(makePageItem('b'+i,i+'',activePage == i,false));
      }
      
      if (hasPostE) {
        bItem.push(makePageItem('post','…',false,true));
        if (boundary)
          bItem.push(makePageItem('b'+itemNum,itemNum+'',false,false));
      }
      
      if (this.state.next)
        bItem.push(makePageItem('next','›',false,activePage == itemNum));
      if (this.state.last)
        bItem.push(makePageItem('last','»',false,activePage == itemNum));
      
      utils.setChildren(this,bItem);
    });
    
    this.listen('activePage', (function(value,oldValue) {
      var fn = this.props.onSelect || this.onSelect;
      if (fn) fn.call(this,value);
    }).bind(this));
    
    this.duals.bsSize = this.props.bsSize || ''; // renew klass
    return state;
    
    function renewKlass(value,oldValue) {
      var sSize = getSizeKlass_('pagination',this.state.bsSize);
      var sCls = utils.setupKlass( this.state.klass,pagination_klass_,'pagination',sSize);
      this.duals.klass = sCls;
    }
    
    function makePageItem(sKey,sTitle,actived,disabled) {
      var props = {key:sKey,'data-key':sKey};
      if (actived)
        props.className = 'active';
      else if (disabled)
        props.className = 'disabled';
      
      var dStyle = {outline:'0'};
      var props2 = {role:'button', href:jsVoid_, style:dStyle};
      if (disabled) {
        props2.tabIndex = '-1';
        dStyle.pointerEvents = 'none';
      }
      return ( <li {...props}>
        <a {...props2}><span>{sTitle}</span></a>
      </li> );
    }
  }
  
  $$onClick(event) {
    var targ = event.target, sKey = '';
    while (targ) {
      if (targ.nodeName == 'LI') {
        sKey = targ.getAttribute('data-key'); // maybe `null`
        break;
      }
      else if (targ.nodeName == 'UL' || targ === document.body)
        break;
      else targ = targ.parentNode;
    }
    
    if (sKey) {  // bN pre post first last prev next
      var iNew = undefined;
      if (sKey[0] == 'b')
        iNew = parseInt(sKey.slice(1));
      else if (sKey == 'first')
        iNew = 1;
      else if (sKey == 'last')
        iNew = parseInt(this.state.items) || 1;
      else {
        var iCurr = parseInt(this.state.activePage) || 1, iLast = parseInt(this.state.items) || 1;
        if (sKey == 'prev')
          iNew = Math.max(1,iCurr - 1);
        else if (sKey == 'next')
          iNew = Math.min(iLast,iCurr + 1);
      }
      
      if (!isNaN(iNew)) this.duals.activePage = iNew;
    }
    
    if (this.$onClick) this.$onClick(event);
  }
}

BS.Pagination_ = TPagination_;
BS.Pagination  = new TPagination_();

var pageritem_klass_ = {disabled:true, previous:true, next:true};

class TPagerItem_ extends BS.Li_ {
  constructor(name,desc) {
    super(name || 'bs.PagerItem',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    this._defaultProp.bsClass = 'pager-item';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.disabled = [iLevel+1,'string',boolPropmpt_];
    dSchema.prev = [iLevel+2,'string',boolPropmpt_];
    dSchema.next = [iLevel+3,'string',boolPropmpt_];
    dSchema.icon = [iLevel+4,'string'];
    dSchema.glyph = [iLevel+5,'string'];
    dSchema.itemSpace = [iLevel+6,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    props.bsClass = 'pager-item';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['icon','glyph','itemSpace'])
        .defineDual(['disabled','prev','next'],renewKlass);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var iSpace = parseInt(this.state.itemSpace);
      var dStyle = {outline:'0'};
      var props = {key:'txt', role:'button', href:jsVoid_, style:dStyle};
      if (!isNaN(iSpace)) {
        dStyle.marginLeft = iSpace + 'px';
        dStyle.marginRight = iSpace + 'px';
      }
      if (this.state.disabled) {
        dStyle.pointerEvents = 'none';
        props.tabIndex = '-1';
      }
      var jsx, sIcon = this.state.icon, glyph = this.state.glyph;
      var sTitle = safeContent(this.state['html.']);
      if (sIcon)
        jsx = <a {...props}><img src={sIcon} style={{position:'relative',top:'-2px'}}/>{sTitle}</a> ;
      else if (glyph)
        jsx = <a {...props}><span className={'glyphicon glyphicon-' + glyph}/>{sTitle}</a> ;
      else jsx = <a {...props}>{sTitle}</a> ;
      
      utils.setChildren(this,[jsx]);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sDisabled = this.state.disabled && 'disabled';
      var sPrev = this.state.prev && 'previous';
      var sNext = this.state.next && 'next';
      var sCls = utils.setupKlass( this.state.klass,pageritem_klass_,sDisabled,sPrev,sNext);
      this.duals.klass = sCls;
    }
  }
}

BS.PagerItem_ = TPagerItem_;
BS.PagerItem  = new TPagerItem_();

BS.Pager_ = makeBsClass3_(BS.Ul_,'Pager','pager');
BS.Pager  = new BS.Pager_();

var grid_klass_ = {container:true, 'container-fluid':true};

class TGrid_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Grid',desc);
    this._statedProp = ['height','left','top'];  // no 'width'
    this._defaultProp.bsClass = 'container';
    this._defaultProp.fluid = '';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.fluid = [iLevel+1,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'container';
    props.fluid = '';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    if (this.props.width === null && W.__design__) { // try change to '100%' when under panel
      var ownerComp = this.parentOf(true);
      if (ownerComp && utils.hasClass(ownerComp,'rewgt-panel'))
        this.duals.width = 0.9999;
    }
    
    this.defineDual('fluid',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass, grid_klass_,
        this.state.fluid? 'container-fluid': 'container'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Grid_ = TGrid_;
BS.Grid  = new TGrid_();

class TRow_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || ('bs.Row'),desc);
    this._statedProp = ['height','left','top'];  // no 'width'
    this._defaultProp.bsClass = 'row';
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'row';
    props.className = 'rewgt-unit row';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    if (this.props.width === null && W.__design__) { // try change to '100%' when under panel
      var ownerComp = this.parentOf(true);
      if (ownerComp && utils.hasClass(ownerComp,'rewgt-panel'))
        this.duals.width = 0.9999;
    }
    
    return state;
  }
}

BS.Row_ = TRow_;
BS.Row  = new TRow_();

var col_klass_ = {'hidden-xs':true,'hidden-sm':true,'hidden-md':true,'hidden-lg':true};
( function(iNum) {
  for (var i=1; i <= iNum; i++) {
    col_klass_['col-xs-' + i] = true;
    col_klass_['col-sm-' + i] = true;
    col_klass_['col-md-' + i] = true;
    col_klass_['col-lg-' + i] = true;
    
    col_klass_['col-xs-offset-' + i] = true;
    col_klass_['col-sm-offset-' + i] = true;
    col_klass_['col-md-offset-' + i] = true;
    col_klass_['col-lg-offset-' + i] = true;
    
    col_klass_['col-xs-pull-' + i] = true;
    col_klass_['col-sm-pull-' + i] = true;
    col_klass_['col-md-pull-' + i] = true;
    col_klass_['col-lg-pull-' + i] = true;
    
    col_klass_['col-xs-push-' + i] = true;
    col_klass_['col-sm-push-' + i] = true;
    col_klass_['col-md-push-' + i] = true;
    col_klass_['col-lg-push-' + i] = true;
  }
})(12);

class TCol_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Col',desc);
    this._defaultProp.bsClass = 'col';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.xs = [iLevel+1,'number'];
    dSchema.sm = [iLevel+2,'number'];
    dSchema.md = [iLevel+3,'number'];
    dSchema.lg = [iLevel+4,'number'];
    dSchema.xsHidden = [iLevel+5,'string',boolPropmpt_];
    dSchema.smHidden = [iLevel+6,'string',boolPropmpt_];
    dSchema.mdHidden = [iLevel+7,'string',boolPropmpt_];
    dSchema.lgHidden = [iLevel+8,'string',boolPropmpt_];
    dSchema.xsOffset = [iLevel+9,'number'];
    dSchema.smOffset = [iLevel+10,'number'];
    dSchema.mdOffset = [iLevel+11,'number'];
    dSchema.lgOffset = [iLevel+12,'number'];
    dSchema.xsPull   = [iLevel+13,'number'];
    dSchema.smPull   = [iLevel+14,'number'];
    dSchema.mdPull   = [iLevel+15,'number'];
    dSchema.lgPull   = [iLevel+16,'number'];
    dSchema.xsPush   = [iLevel+17,'number'];
    dSchema.smPush   = [iLevel+18,'number'];
    dSchema.mdPush   = [iLevel+19,'number'];
    dSchema.lgPush   = [iLevel+20,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'col';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual([ 'xs','sm','md','lg',
      'xsHidden','smHidden','mdHidden','lgHidden',
      'xsOffset','smOffset','mdOffset','lgOffset',
      'xsPull','smPull','mdPull','lgPull',
      'xsPush','smPush','mdPush','lgPush',
    ],renewKlass);
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sMainCls = utils.klassNames( makeIdxKlass('col-xs-',this.state.xs),
        makeIdxKlass('col-sm-',this.state.sm),
        makeIdxKlass('col-md-',this.state.md),
        makeIdxKlass('col-lg-',this.state.lg) );
      var sOffset = utils.klassNames( makeIdxKlass('col-xs-offset-',this.state.xsOffset),
        makeIdxKlass('col-sm-offset-',this.state.smOffset),
        makeIdxKlass('col-md-offset-',this.state.mdOffset),
        makeIdxKlass('col-lg-offset-',this.state.lgOffset) );
      var sPull = utils.klassNames( makeIdxKlass('col-xs-pull-',this.state.xsPull),
        makeIdxKlass('col-sm-pull-',this.state.smPull),
        makeIdxKlass('col-md-pull-',this.state.mdPull),
        makeIdxKlass('col-lg-pull-',this.state.lgPull) );
      var sPush = utils.klassNames( makeIdxKlass('col-xs-push-',this.state.xsPush),
        makeIdxKlass('col-sm-push-',this.state.smPush),
        makeIdxKlass('col-md-push-',this.state.mdPush),
        makeIdxKlass('col-lg-push-',this.state.lgPush) );
      var sHidden = utils.klassNames( this.state.xsHidden && 'hidden-xs',
        this.state.smHidden && 'hidden-sm',
        this.state.mdHidden && 'hidden-md',
        this.state.lgHidden && 'hidden-lg' );
      
      var sCls = utils.setupKlass( this.state.klass,col_klass_,
        sMainCls, sOffset, sPull, sPush, sHidden
      );
      this.duals.klass = sCls;
    }
    
    function makeIdxKlass(sPrefix,i) {
      if (typeof i == 'number')
        return sPrefix + i;
      else return '';
    }
  }
}

BS.Col_ = TCol_;
BS.Col  = new TCol_();

var clearfix_klass_  = {'visible-xs-block':true, 'visible-sm-block':true,
  'visible-md-block':true, 'visible-lg-block':true,
};

class TClearfix_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Clearfix',desc);
    this._defaultProp.bsClass = 'clearfix';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.xsBlock = [iLevel+1,'string',boolPropmpt_];
    dSchema.smBlock = [iLevel+2,'string',boolPropmpt_];
    dSchema.mdBlock = [iLevel+3,'string',boolPropmpt_];
    dSchema.lgBlock = [iLevel+4,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'clearfix',
      className:'rewgt-unit clearfix',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['xsBlock','smBlock','mdBlock','lgBlock'],renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,clearfix_klass_,
        this.state.xsBlock && 'visible-xs-block',
        this.state.smBlock && 'visible-sm-block',
        this.state.mdBlock && 'visible-md-block',
        this.state.lgBlock && 'visible-lg-block'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Clearfix_ = TClearfix_;
BS.Clearfix  = new TClearfix_();

BS.Jumbotron_ = makeBsClass3_(BS.Div2_,'Jumbotron','jumbotron');
BS.Jumbotron  = new BS.Jumbotron_();

class TPageHeader_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.PageHeader',desc);
    this._defaultProp.bsClass = 'page-header';
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'page-header',
      className:'rewgt-unit page-header',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    if (!hasChildNode_(this.props.children))
      utils.setChildren(this,null, <h1/> );
    
    return state;
  }
}

BS.PageHeader_ = TPageHeader_;
BS.PageHeader  = new TPageHeader_();

BS.ListGroup_ = makeBsClass3_(BS.Div2_,'ListGroup','list-group');
BS.ListGroup  = new BS.ListGroup_();

var listgroupitem_klass_ = { active:true, disabled:true,
  'list-group-item-success':true, 'list-group-item-info':true,
  'list-group-item-warning':true, 'list-group-item-danger':true,
};

var markeditem_padding_ = [0,null,0,null];

function MakeListItemCls(TBase,sClsName) {
  class T extends TBase {
    constructor(name,desc) {
      super(name || ('bs.'+sClsName),desc);
      this._docUrl = bsDocUrl_;
      if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
      this._defaultProp.bsClass = 'list-group-item';
      this._defaultProp.bsStyle = '';
      if (sClsName == 'MarkedItem')
        this._defaultProp.padding = markeditem_padding_.slice(0);
    }
    
    _getSchema(self,iLevel) {
      iLevel = iLevel || 1200;
      var dSchema = super._getSchema(self,iLevel + 200);
      
      dSchema.bsStyle = [iLevel+1,'string',['','success','warning','danger','info']];
      dSchema.disabled = [iLevel+2,'string',boolPropmpt_];
      dSchema['data-checked'] = [iLevel+3,'string',boolPropmpt_];
      return dSchema;
    }
    
    getDefaultProps() {
      var props = super.getDefaultProps();
      if (sClsName == 'MarkedItem') props.padding = markeditem_padding_.slice(0);
      if (W.__design__) props['data-html.opt'] = 'edit';
      return Object.assign(props, { 'childInline.':true, bsClass:'list-group-item',
        className:'rewgt-unit list-group-item', bsStyle:'',
      });
    }
    
    getInitialState() {
      var state = super.getInitialState();
      
      this.defineDual(['bsStyle','disabled','data-checked'],renewKlass);
      if (sClsName == 'ListItem') {
        this.defineDual('header')
            .defineDual('href', function(value,oldValue) {
          if (!value && typeof value == 'string')
            this.state.href = jsVoid_;  // change '' to 'javascript:void(0)'
        });
        this.defineDual('id__', function(value,oldValue) {
          if (value <= 2) return;
          
          if (hasChildNode_(this.props.children)) {
            this.state['tagName.'] = 'div';
            return;
          }
          
          var jsx = [], sHeader = safeContent(this.state.header);
          if (this.state.href || sHeader) {
            this.state['tagName.'] = 'a';
            if (sHeader)
              jsx.push( <h4 key='head' className='list-group-item-heading'>{sHeader}</h4> );
            var sHtml = safeContent(this.state['html.']);
            jsx.push( <p key='txt' className='list-group-item-text'>{sHtml}</p> );
          }
          else this.state['tagName.'] = 'div';
          utils.setChildren(this,jsx);
        });
      }
      
      return state;
      
      function renewKlass(value,oldValue) {
        var sStyle = this.state.bsStyle;
        if (sStyle) sStyle = 'list-group-item-' + sStyle;
        
        var sCls = utils.setupKlass( this.state.klass,listgroupitem_klass_,
          sStyle, this.state.disabled && 'disabled',
          this.state['data-checked'] && 'active'
        );
        this.duals.klass = sCls;
      }
    }
    
    $$onClick(event) {
      if (W.__design__) event.preventDefault();  // avoid jump <a>
      if (this.$onClick) this.$onClick(event);
    }
  }
  
  return T;
}

BS.MarkedItem_ = MakeListItemCls(BS.MarkedDiv_,'MarkedItem');
BS.MarkedItem  = new BS.MarkedItem_();

BS.ListItem_ = MakeListItemCls(BS.Div2_,'ListItem');
BS.ListItem  = new BS.ListItem_();

var table_klass_ = { table:true, 'table-responsive':true,
  'table-striped':true, 'table-bordered':true,
  'table-condensed':true, 'table-hover':true,
};

class TTable_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Table',desc);
    this._defaultProp.bsClass = 'table';
    this._defaultProp.responsive = '';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.striped = [iLevel+1,'string',boolPropmpt_];
    dSchema.bordered = [iLevel+2,'string',boolPropmpt_];
    dSchema.condensed = [iLevel+3,'string',boolPropmpt_];
    dSchema.hover = [iLevel+4,'string',boolPropmpt_];
    dSchema.responsive = [iLevel+5,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = props['tagName.'] = 'table';
    props.responsive = '';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('responsive', function(value,oldValue) {
      this.state['tagName.'] = value? 'div': 'table';
      if (!value) utils.setChildren(this,null,null);
      renewKlass.call(this);
    });
    this.defineDual(['striped','bordered','condensed','hover'],renewKlass);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (!this.state.responsive) return;
      
      var sCls = getTableKlass(this);
      utils.setChildren(this,null, <table className={sCls} /> );
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = this.state.responsive? 'table-responsive': getTableKlass(this);
      sCls = utils.setupKlass( this.state.klass,table_klass_,sCls );
      this.duals.klass = sCls;
    }
    
    function getTableKlass(comp) {
      return utils.klassNames( 'table', comp.state.striped && 'table-striped',
        comp.state.bordered && 'table-bordered',
        comp.state.condensed && 'table-condensed',
        comp.state.hover && 'table-hover' );
    }
  }
}

BS.Table_ = TTable_;
BS.Table  = new TTable_();

class TPanelHeader_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.PanelHeader',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    this._defaultProp.bsClass = 'panel-heading';
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { bsClass:'panel-heading',
      className:'rewgt-unit panel-heading',
    });
  }
  
  $$onClick(event) {
    if (this.isAccordion_) {
      var owner = this.parentOf(true);
      if (owner && owner.props.bsClass === 'panel') {
        var sKey = owner.duals.keyid + '';
        owner = owner.parentOf(true);
        if (owner && owner.props.bsClass === 'panel-group') {
          if (owner.props.accordion) {
            if (owner.duals.activeKey === sKey)
              sKey = '';
            owner.duals.activeKey = sKey;
          }
        }
      }
    }
    if (this.$onClick) this.$onClick(event);
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    var owner = this.parentOf(true);
    if (owner && owner.props.bsClass === 'panel') {
      owner = owner.parentOf(true);
      if (owner && owner.props.bsClass === 'panel-group') {
        if (owner.props.accordion)
          this.isAccordion_ = true;
      }
    }
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (hasChildNode_(this.props.children)) return;
      
      var sTitle = safeContent(this.state['html.']);
      var jsx = (this.isAccordion_? <a key='txt' style={{cursor:'pointer'}}>{sTitle}</a> : <span key='txt'>{sTitle}</span> );
      utils.setChildren(this,[ jsx ]);
    });
    
    return state;
  }
}

BS.PanelHeader_ = TPanelHeader_;
BS.PanelHeader  = new TPanelHeader_();

BS.PanelFooter_ = makeBsClass3_(BS.Div2_,'PanelFooter','panel-footer');
BS.PanelFooter  = new BS.PanelFooter_();

BS.PanelBody_ = makeBsClass3_(BS.Div2_,'PanelBody','panel-body');
BS.PanelBody  = new BS.PanelBody_();

BS.PanelCollapse_ = MakeCollapseCls('PanelCollapse','panel-collapse');
BS.PanelCollapse  = new BS.PanelCollapse_();

var panel_klass_ = { 'panel-default':true, 'panel-success':true,
  'panel-warning':true, 'panel-danger':true, 'panel-info':true,
  'panel-primary':true,
};

class TPanel_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Panel',desc);
    Object.assign(this._defaultProp, { bsClass:'panel',
      bsStyle:'default',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsStyle = [iLevel+1,'string',['default','success','warning','danger','info','primary']];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'panel',
      className:'rewgt-unit panel', bsStyle:'default',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('bsStyle',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sStyle = 'panel-' + this.state.bsStyle;
      var sCls = utils.setupKlass( this.state.klass,panel_klass_,sStyle);
      this.duals.klass = sCls;
    }
  }
}

BS.Panel_ = TPanel_;
BS.Panel  = new TPanel_();

class TPanelGroup_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.PanelGroup',desc);
    Object.assign(this._defaultProp, { bsClass:'panel-group',
      activeKey:'',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.activeKey = [iLevel+1,'string'];
    dSchema.accordion = [iLevel+2,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'panel-group',
      className:'rewgt-unit panel-group', activeKey:'',
    });
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    this.listen('activeKey', ( function(value,oldValue) {
      this.selectPanel(value);
    }).bind(this));
    this.selectPanel(this.state.activeKey);
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.selectPanel = ( function(sKey) {
      if (typeof sKey != 'string') sKey = '';
      utils.eachComponent(this, function(child) {
        if (child.props.bsClass == 'panel')
          setPanelActive(child,sKey && sKey == child.duals.keyid);
      });
    }).bind(this);
    
    this.defineDual('activeKey',null,'');
    
    return state;
    
    function setPanelActive(comp,toActive) {
      utils.eachComponent(comp, function(child) {
        if (child.props.role === 'collapsible')
          child.duals.expanded = boolToStr(toActive);
      });
    }
  }
}

BS.PanelGroup_ = TPanelGroup_;
BS.PanelGroup  = new TPanelGroup_();

var well_klass_ = {'well-lg':true, 'well-sm':true};

class TWell_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Well',desc);
    this._defaultProp.bsClass = 'well';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsSize = [iLevel+1,'string',['','large','small']];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'well',
      className:'rewgt-unit well',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('bsSize',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sSize = getSizeKlass_('well',this.state.bsSize);
      var sCls = utils.setupKlass( this.state.klass,well_klass_,sSize);
      this.duals.klass = sCls;
    }
  }
}

BS.Well_ = TWell_;
BS.Well  = new TWell_();

var formgroup_klass_ = { 'form-group-lg':true, 'form-group-sm':true,
  'has-feedback':true, 'has-success':true,
  'has-warning':true, 'has-error':true,
};

class TFormGroup_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.FormGroup',desc);
    Object.assign(this._defaultProp,{bsClass:'form-group',validation:''});
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsSize = [iLevel+1,'string',['','large','small']];
    dSchema.validation = [iLevel+2,'string',['','success','warning','error']];
    dSchema.controlId = [iLevel+3,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'form-group',
      validation:'', className:'rewgt-unit form-group',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual(['bsSize','validation','controlId']);
    if (!this.props.controlId) state.controlId = newControlId_();
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sSize = getSizeKlass_('form-group',this.state.bsSize);
      var sFeedback = '', sValid = this.state.validation || '';
      if (sValid) sValid = 'has-' + sValid;
      utils.eachElement(this, function(ele) {
        var bsCls = ele.props.bsClass;
        if (bsCls === 'form-control-feedback')
          sFeedback = 'has-feedback';
        else if (bsCls === 'col') {
          var bChild = ele.props.children;
          if (Array.isArray(bChild)) {
            bChild.forEach( function(ele2) {
              if (ele2 && ele2.props.bsClass === 'form-control-feedback')
                sFeedback = 'has-feedback';
            });
          }
        }
      });
      
      var sCls = utils.setupKlass( this.state.klass,formgroup_klass_,sSize,sFeedback,sValid);
      this.duals.klass = sCls;
    });
    
    return state;
  }
}

BS.FormGroup_ = TFormGroup_;
BS.FormGroup  = new TFormGroup_();

class TCtrlLabel_ extends T.Label_ {
  constructor(name,desc) {
    super(name || 'bs.CtrlLabel',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'control-label';
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'control-label',
      className:'control-label',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    var hasCol = false, owner = this.parentOf(true);
    if (owner && owner.props.bsClass == 'col') {
      hasCol = true;
      owner = owner.parentOf(true);
    }
    if (!this.props.htmlFor && owner) {
      var sId;
      if (owner && owner.props.bsClass == 'form-group' && (sId=owner.state.controlId))
        this.defineDual('htmlFor',null,sId);
    }
    
    var newStyle = Object.assign({},this.props.style), styChanged =false;
    if (hasCol) {
      if (!newStyle.padding) {
        if (!newStyle.paddingLeft) {
          newStyle.paddingLeft = '15px';
          styChanged = true;
        }
        if (!newStyle.paddingRight) {
          newStyle.paddingRight = '15px';
          styChanged = true;
        }
      }
      if (!newStyle.width) {
        newStyle.width = '100%';
        styChanged = true;
      }
    }
    else {
      if (!newStyle.lineHeight) {
        newStyle.lineHeight = '20px';  // fix bug of bootstrap 3.3.7
        styChanged = true;
      }
    }
    if (styChanged) this.duals.style = newStyle;
    
    return state;
  }
}

BS.CtrlLabel_ = TCtrlLabel_;
BS.CtrlLabel  = new TCtrlLabel_();

var formcontrol_klass_ = {'input-lg':true, 'input-sm':true};

class TFormCtrl_ extends T.Input_ {
  constructor(name,desc) {
    super(name || 'bs.FormCtrl',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'form-control';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsSize = [iLevel+1,'string',['','large','small']];
    dSchema.multiple = [iLevel+2,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'form-control',
      className:'form-control',  // default type='text'
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    if (!this.props.id) {
      var sId, owner = this.parentOf(true);
      if (owner && owner.props.bsClass == 'form-group' && (sId=owner.state.controlId))
        this.defineDual('id',null,sId);
    }
    
    this.defineDual('bsSize',renewKlass);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sType = this.state.type;
      if (sType === 'select')
        this.state['tagName.'] = 'select';
      else if (sType === 'textarea')
        this.state['tagName.'] = 'textarea';
      else this.state['tagName.'] = 'input';
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = getSizeKlass_('input',this.state.bsSize);
      sCls = utils.setupKlass( this.state.klass,formcontrol_klass_,sCls );
      this.duals.klass = sCls;
    }
  }
}

BS.FormCtrl_ = TFormCtrl_;
BS.FormCtrl  = new TFormCtrl_();

BS.FormCtrlStatic_ = makeBsClass3_(BS.P_,'FormCtrlStatic','form-control-static');
BS.FormCtrlStatic  = new BS.FormCtrlStatic_();

var formfeedback_klass_ = { glyphicon:true, 'glyphicon-remove':true,
  'glyphicon-ok':true, 'glyphicon-warning-sign':true,
};

function validationTag(s) {
  if (s === 'success')
    return 'glyphicon glyphicon-ok';
  else if (s === 'warning')
    return 'glyphicon glyphicon-warning-sign';
  else if (s === 'error')
    return 'glyphicon glyphicon-remove';
  else return '';
}

class TFormFeedback_ extends T.Span_ {
  constructor(name,desc) {
    super(name || 'bs.FormFeedback',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'form-control-feedback';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.validation = [iLevel+1,'string',['','success','warning','error']];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'form-control-feedback',
      className:'form-control-feedback',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('validation',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sValid;
      if (hasChildNode_(this.props.children)) // should prepare glyphicon in children
        sValid = '';
      else sValid = validationTag(this.state.validation);
      
      var sCls = utils.setupKlass( this.state.klass,formfeedback_klass_,sValid);
      this.duals.klass = sCls;
    }
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    var owner = this.parentOf(true);
    if (owner) {
      if (owner.props.bsClass === 'col') {
        owner = owner.parentOf(true);
        if (!owner) return;
      }
      
      if (owner.props.bsClass === 'form-group') {
        owner.listen('validation',this,'validation');
        this.duals.validation = owner.state.validation;
      }
    }
  }
}

BS.FormFeedback_ = TFormFeedback_;
BS.FormFeedback  = new TFormFeedback_();

BS.HelpBlock_ = makeBsClass3_(T.Span_,'HelpBlock','help-block',true);
BS.HelpBlock  = new BS.HelpBlock_();

var checkbox_klass_ = { disabled:true, checkbox:true, 'checkbox-inline':true,
  radio:true, 'radio-inline':true,
};

class TCheckbox_ extends T.Label_ {
  constructor(name,desc) {
    super(name || 'bs.Checkbox',desc);
    this._docUrl = bsDocUrl_;
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    this._defaultProp.bsClass = 'checkbox';
    this._defaultProp.block = '';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.block = [iLevel+1,'string',boolPropmpt_];
    dSchema.disabled = [iLevel+2,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { bsClass:'checkbox', block:'' });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.onCheckClick_ = ( function(event) {
      if (this.state.disabled) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
    }).bind(this);
    this.onCheckChange_ = ( function(event) {
      this.duals.checked = boolToStr(event.target.checked);
    }).bind(this);
    
    var initChecked = this.props.checked;
    if (initChecked === undefined)
      initChecked = this.props.defaultChecked;
    initChecked = boolToStr(initChecked);
    if (this.props.name) { // not under control
      this.defineDual('checked'); // default undefined
      if (initChecked) {
        setTimeout( function(self) {
          var node = self.getHtmlNode();
          var checkNode = node && node.querySelector('input');
          if (checkNode) {
            checkNode.checked = true;
            self.duals.checked = '1';
          }
        },300,this); // wait 300 ms to ensure input node ready
      }
    }
    else this.defineDual('checked',null,initChecked);
    
    this.defineDual(['block','disabled'],renewKlass);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var underCtrl = !this.props.name;
      var isBlock = this.state.block;
      this.state['tagName.'] = isBlock? 'div': 'label';
      
      var jsx, sHtml = safeContent(this.state['html.']), sName = !underCtrl && this.state.name;
      var props = { type:this.props.bsClass,
        onClick: this.onCheckClick_,
        onChange: this.onCheckChange_,
      };
      var props2 = {key:'tit'};
      if (underCtrl) props.checked = this.state.checked;
      if (sName) props.name = sName;
      if (this.state.disabled) {
        props.readOnly = '1';
        props.disabled = '1';
        props2.style = {cursor:'not-allowed'};
      }
      else {
        props.readOnly = '';
        props.disabled = '';
        props2.style = {cursor:''};
      }
      if (isBlock)
        jsx = [ <label key='chk'><input {...props}/>{sHtml}</label> ];
      else jsx = [ <input key='chk' {...props}/> , <span {...props2}>{sHtml}</span> ];
      
      utils.setChildren(this,jsx);
    });
    
    var newStyle = undefined, oldStyle = this.props.style;
    if (oldStyle) {
      if (!oldStyle.lineHeight) {
        newStyle = Object.assign({},oldStyle);
        newStyle.lineHeight = '20px';
      }
    }
    else newStyle = {lineHeight:'20px'};
    if (newStyle) this.duals.style = newStyle; // fix bug of bootstrap 3.3.7
    
    return state;
    
    function renewKlass(value,oldValue) {
      var isBlock = this.state.block, sType = this.props.bsClass;
      var sMainCls = isBlock? sType: sType+'-inline';
      var sDisabled = isBlock && this.state.disabled && 'disabled';
      
      var sCls = utils.setupKlass( this.state.klass,checkbox_klass_,sMainCls,sDisabled);
      this.duals.klass = sCls;
    }
  }
}

BS.Checkbox_ = TCheckbox_;
BS.Checkbox  = new TCheckbox_();

class TRadio_ extends TCheckbox_ {
  constructor(name,desc) {
    super(name || 'bs.Radio',desc);
    this._defaultProp.bsClass = 'radio';
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'radio' });
  }
}

BS.Radio_ = TRadio_;
BS.Radio  = new TRadio_();

var inputgroup_klass_ = {'input-group-lg':true, 'input-group-sm':true};

class TInputGroup_ extends T.Span_ {
  constructor(name,desc) {
    super(name || 'bs.InputGroup',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'input-group';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsSize = [iLevel+1,'string',['','large','small']];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, {bsClass:'input-group', className:'input-group'});
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('bsSize',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sSize = getSizeKlass_('input-group',this.state.bsSize);
      var sCls = utils.setupKlass( this.state.klass,inputgroup_klass_,sSize);
      this.duals.klass = sCls;
    }
  }
}

BS.InputGroup_ = TInputGroup_;
BS.InputGroup  = new TInputGroup_();

BS.InputGroupAddon_ = makeBsClass3_(T.Span_,'InputGroupAddon','input-group-addon',true);
BS.InputGroupAddon  = new BS.InputGroupAddon_();

BS.InputGroupBtn_ = makeBsClass3_(T.Span_,'InputGroupBtn','input-group-btn',true);
BS.InputGroupBtn  = new BS.InputGroupBtn_();

class TGlyphicon_ extends T.Span_ {
  constructor(name,desc) {
    super(name || 'bs.Glyphicon',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'glyphicon';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.glyph = [iLevel+1,'string'];
    dSchema.itemSpace = [iLevel+2,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, {bsClass:'glyphicon', className:'glyphicon'});
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('glyph',renewKlass);
    this.defineDual('itemSpace',itemSpaceFn_);
    return state;
    
    function renewKlass(value,oldValue) {
      var sGlyph = this.state.glyph;
      if (sGlyph) sGlyph = 'glyphicon-' + sGlyph;
      
      var b = this.state.klass.split(/ +/), len = b.length;
      for (var i=len-1; i >= 0; i--) {
        var s = b[i];
        if (s.indexOf('glyphicon-') == 0)
          b.splice(i,1);
      }
      
      var sCls = utils.klassNames(b.join(' '),sGlyph);
      this.duals.klass = sCls;
    }
  }
}

BS.Glyphicon_ = TGlyphicon_;
BS.Glyphicon  = new TGlyphicon_();

var image_klass_ = { 'img-circle':true, 'img-rounded':true,
  'img-thumbnail':true, 'img-responsive':true,
};

class TImage_ extends T.Img_ {
  constructor(name,desc) {
    super(name || 'bs.Image',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'img';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.circle = [iLevel+1,'string',boolPropmpt_];
    dSchema.rounded = [iLevel+2,'string',boolPropmpt_];
    dSchema.thumbnail = [iLevel+3,'string',boolPropmpt_];
    dSchema.responsive = [iLevel+4,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'img';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual(['circle','rounded','thumbnail','responsive'],renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,image_klass_,
        this.state.circle && 'img-circle',
        this.state.rounded && 'img-rounded',
        this.state.thumbnail && 'img-thumbnail',
        this.state.responsive && 'img-responsive'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Image_ = TImage_;
BS.Image  = new TImage_();

class TThumbnail_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Thumbnail',desc);
    this._defaultProp.bsClass = 'thumbnail';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.src = [iLevel+1,'string'];
    dSchema.alt = [iLevel+2,'string'];
    dSchema.href = [iLevel+3,'string'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'thumbnail';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    var imgOnErr   = this.props.onError || this.onError;
    var imgOnLoad  = this.props.onLoad || this.onLoad;
    this.imgOnErr_ = imgOnErr? imgOnErr.bind(this): null;
    this.imgOnLoad_ = imgOnLoad? imgOnLoad.bind(this): null;
    
    this.defineDual(['src','alt']);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var sSrc = this.state.src || '', sAlt = this.state.alt || '';
      var props = {key:'img', src:sSrc};
      if (sAlt) props.alt = sAlt;
      if (this.imgOnLoad_) props.onLoad = this.imgOnLoad_;
      if (this.imgOnErr_) props.onError = this.imgOnErr_;
      
      var sCls = utils.clearKlass(this.state.klass,['thumbnail']);
      if (hasChildNode_(this.props.children)) {
        this.state.klass = utils.klassNames(sCls,'thumbnail');
        utils.setChildren(this,null,[ <img {...props}/> , <div key='foo' className='caption'/> ]);
      }
      else {
        var sHref = this.state.href || jsVoid_;
        this.state.klass = sCls;
        utils.setChildren(this,[ <a key='lnk' className='thumbnail' role='button' href={sHref}><img {...props}/></a> ],null);
      }
    });
    
    return state;
  }
}

BS.Thumbnail_ = TThumbnail_;
BS.Thumbnail  = new TThumbnail_();

var res_embed_klass_ = {'embed-responsive-16by9':true, 'embed-responsive-4by3':true};

class TResponsiveEmbed_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.ResponsiveEmbed',desc);
    this._defaultProp.bsClass = 'embed-responsive';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.a16by9 = [iLevel+1,'string',boolPropmpt_];
    dSchema.a4by3 = [iLevel+2,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'embed-responsive',
      className:'rewgt-unit embed-responsive',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual(['a16by9','a4by3'],renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      if (!this.state.a4by3)
        this.state.a16by9 = '1';  // a4by3 or a16by9 must have one
      
      var sCls = utils.setupKlass( this.state.klass,res_embed_klass_,
        this.state.a16by9 && 'embed-responsive-16by9',
        this.state.a4by3 && 'embed-responsive-4by3'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.ResponsiveEmbed_ = TResponsiveEmbed_;
BS.ResponsiveEmbed  = new TResponsiveEmbed_();

class TCarousel_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Carousel',desc);
    Object.assign(this._defaultProp,{ bsClass:'carousel',
      indicators:'1', wrap:'1', activeIndex:0,
      slide:'1', pauseHover:'1',
    });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    
    dSchema.activeIndex = [iLevel+1,'number'];
    dSchema.wrap       = [iLevel+2,'string',boolPropmpt_];
    dSchema.controls   = [iLevel+3,'string',boolPropmpt_];
    dSchema.indicators = [iLevel+4,'string',boolPropmpt_];
    
    dSchema.slide      = [iLevel+5,'string',boolPropmpt_];
    dSchema.pauseHover = [iLevel+6,'string',boolPropmpt_];
    dSchema.interval   = [iLevel+7,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'carousel',
      className:'rewgt-unit carousel', 
      controls:'1', indicators:'1', wrap:'1', activeIndex:0,
      slide:'1', pauseHover:'1',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.direction = 'left';  // turn page to left or right
    this.isPaused  = true; this.timeout_  = 0;
    this.subKeys_  = []; this.subNumb_  = 0;
    
    this.onPrevClick_ = ( function(event) {
      if (W.__design__) return;
      this.goPrev(false);
    }).bind(this);
    
    this.onNextClick_ = ( function(event) {
      if (W.__design__) return;
      this.goNext(false);
    }).bind(this);
    
    state.controls = '1'; state.indicators = '1';
    state.wrap = '1'; state.pauseHover = '1';
    this.defineDual(['controls','indicators','activeIndex','wrap','pauseHover','interval']);
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var bChild = utils.eachElement(this), itemNum = bChild.length;
      if (!itemNum) return; // fatal error
      
      var hasCtrl = this.state.controls, hasInd = this.state.indicators;
      var isWrap = this.state.wrap;
      var activeIndex = parseInt(this.state.activeIndex) || 0, subKeys = [];
      var bItem = bChild.map( function(ele,idx) {
        subKeys.push(utils.keyOfElement(ele));
        if (!hasInd) return null;
        
        var props = {key:'a'+idx, style:{margin:'0 3px'}};
        if (idx == activeIndex)
          props.className = 'active';
        return <li {...props}/> ;
      });
      this.subKeys_ = subKeys;
      this.subNumb_ = itemNum;
      
      var insertEle = [ <div key='foo' className='carousel-inner'/> ];
      if (hasInd)
        insertEle.unshift( <ol key='ind' className='carousel-indicators'>{bItem}</ol> );
      if (isWrap || activeIndex > 0) {
        if (hasCtrl) {
          insertEle.push( <a key='left' className='carousel-control left' role='button' href={jsVoid_} onClick={this.onPrevClick_}>
            <span className='glyphicon glyphicon-chevron-left'/>
          </a> );
        }
      }
      if (isWrap || activeIndex < itemNum-1) {
        if (hasCtrl) {
          insertEle.push( <a key='right' className='carousel-control right' role='button' href={jsVoid_} onClick={this.onNextClick_}>
            <span className='glyphicon glyphicon-chevron-right'/>
          </a> );
        }
      }
      
      utils.setChildren(this,null,insertEle);
    });
    
    return state;
  }
  
  goPrev(exitPlay) {
    if (!this.isPaused) {
      this.pause();
      if (!exitPlay) {
        setTimeout( function(self) {
          self.play();
        },1000,this);
      }
    }
    
    this.direction = 'right';
    var idx = parseInt(this.state.activeIndex) || 0, iNum = this.subNumb_ || 1;
    if (idx > 0)
      this.duals.activeIndex = idx - 1;
    else this.duals.activeIndex = iNum - 1;
  }
  
  goNext(exitPlay) {
    if (!this.isPaused) {
      this.pause();
      if (!exitPlay) {
        setTimeout( function(self) {
          self.play();
        },1000,this);
      }
    }
    
    this.direction = 'left';
    var idx = (parseInt(this.state.activeIndex) || 0) + 1, iNum = this.subNumb_ || 1;
    if (idx < iNum)
      this.duals.activeIndex = idx;
    else this.duals.activeIndex = 0;
  }
  
  stepNext_() {
    var activeIndex = parseInt(this.state.activeIndex) || 0, iNextPg = activeIndex + 1;
    if (iNextPg >= this.subNumb_) {
      if (this.state.wrap)
        iNextPg = 0;
      else {
        this.pause();
        return;  // playing has finished
      }
    }
    
    var interval = parseInt(this.state.interval) || 5000, tmout = this.timeout_;
    if (tmout) clearTimeout(tmout);
    this.timeout_ = setTimeout( function(self) {
      self.duals.activeIndex = iNextPg;
      self.timeout_ = setTimeout( function() { // continue running
        self.stepNext_();
      },interval);
    },interval,this);
  }
  
  play() {
    if (W.__design__) return;
    
    if (!this.isPaused) return;
    if (!this.props.slide) return;
    
    this.direction = 'left';
    this.isPaused = false;
    this.stepNext_();
  }
  
  pause() {
    if (W.__design__) return;
    
    var tmout = this.timeout_;
    this.timeout_ = 0;
    if (tmout) clearTimeout(tmout);
    this.isPaused = true;
  }
  
  componentDidMount() {
    super.componentDidMount();
    if (this.props.slide) this.play();
  }
  
  $$onMouseOver(event) {
    if (this.props.slide && this.state.pauseHover) {
      var tmout = this.timeout_;
      this.timeout_ = 0;
      if (tmout) clearTimeout(tmout);
    }
    
    if (this.$onMouseOver) this.$onMouseOver(event);
  }
  
  $$onMouseOut(event) {
    if (this.props.slide && this.state.pauseHover && !this.isPaused && !this.timeout_) {
      this.direction = 'left';
      this.stepNext_();
    }
    
    if (this.$onMouseOut) this.$onMouseOut(event);
  }
}

BS.Carousel_ = TCarousel_;
BS.Carousel  = new TCarousel_();

var carouselitem_klass_ = {active:true, left:true, right:true, prev:true, next:true};

class TCarouselItem_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.CarouselItem',desc);
    Object.assign(this._defaultProp,{ bsClass:'carousel-item',
      active:'',
    });
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'carousel-item',
      className:'rewgt-unit item', active:'',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    var ownerComp = this.parentOf(true);
    if (!ownerComp || ownerComp.props.bsClass !== 'carousel')
      ownerComp = null;
    
    this.onActiveIndex = ( function(value,oldValue) {
      if (!ownerComp) return;
      
      var idx = parseInt(value) || 0, sKey = ownerComp.subKeys_[idx];
      if (!ownerComp.props.slide) {   // no animate
        this.duals.active = boolToStr(sKey == this.duals.keyid);
        return;
      }
      
      var sDir = ownerComp.direction; // turn page to 'left' or 'right'
      var sOld = boolToStr(this.state.active), sNew = boolToStr(sKey == this.duals.keyid);
      if (sOld !== sNew) {
        var sCls = utils.clearKlass(this.state.klass,carouselitem_klass_);
        if (sNew) {  // hidden --> show
          var sFrom = sDir == 'left'? 'next': 'prev';
          this.duals.klass = utils.klassNames(sCls,sFrom);
          setTimeout( function(self) {
            self.duals.klass = utils.klassNames(sCls,sFrom,sDir);
            nextStep(self,sNew);
          },100,this);
        }
        else {  // show --> hidden
          setTimeout( function(self) {
            self.duals.klass = utils.klassNames(sCls,'active',sDir);
            nextStep(self,sNew);
          },100,this);
        }
      }
      
      function nextStep(self,sNew) {
        setTimeout( function() {
          self.duals.active = sNew;
        },600);
      }
    }).bind(this);
    
    this.defineDual('active',renewKlass);
    this.defineDual('id__', function(value,oldValue) {
      if (oldValue == 1) {
        if (ownerComp) {
          ownerComp.listen('activeIndex',this); // owner's activeIndex --> this.onActiveIndex()
          
          var idx = parseInt(ownerComp.duals.activeIndex) || 0;
          var sKey = ownerComp.subKeys_[idx];
          this.duals.active = boolToStr(sKey == this.duals.keyid);
        }
      }
      // if (value <= 2) return;
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,carouselitem_klass_,
        this.state.active && 'active'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.CarouselItem_ = TCarouselItem_;
BS.CarouselItem  = new TCarouselItem_();

BS.CarouselCaption_ = makeBsClass3_(BS.Div2_,'CarouselCaption','carousel-caption');
BS.CarouselCaption  = new BS.CarouselCaption_();

BS.Media_ = makeBsClass3_(BS.Div2_,'Media','media');
BS.Media  = new BS.Media_();

var medialeft_klass_ = {'media-top':true, 'media-middle':true, 'media-bottom':true};

class TMediaLeft_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.MediaLeft',desc);
    this._defaultProp.bsClass = 'media-left';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.alignTo = [iLevel+1,'string',['top','middle','bottom']];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.bsClass = 'media-left';
    props.className = 'rewgt-unit media-left';
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('alignTo',renewKlass);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,medialeft_klass_,
        'media-' + (this.state.alignTo || 'top')
      );
      this.duals.klass = sCls;
    }
  }
}

BS.MediaLeft_ = TMediaLeft_;
BS.MediaLeft  = new TMediaLeft_();

BS.MediaRight_ = makeBsClass3_(TMediaLeft_,'MediaRight','media-right');
BS.MediaRight  = new BS.MediaRight_();

BS.MediaBody_ = makeBsClass3_(BS.Div2_,'MediaBody','media-body');
BS.MediaBody  = new BS.MediaBody_();

BS.MediaHeading_ = makeBsClass3_(BS.H4_,'MediaHeading','media-heading');
BS.MediaHeading  = new BS.MediaHeading_();

BS.MediaList_ = makeBsClass3_(BS.Ul_,'MediaList','media-list');
BS.MediaList  = new BS.MediaList_();

BS.MediaItem_ = makeBsClass3_(BS.Li_,'MediaItem','media');
BS.MediaItem  = new BS.MediaItem_();

var label_klass_ = { 'label-default':true, 'label-success':true,
  'label-warning':true, 'label-danger':true, 'label-info':true,
  'label-primary':true,
};

class TLabel_ extends T.Span_ {
  constructor(name,desc) {
    super(name || 'bs.Label',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'label';
    this._defaultProp.bsStyle = 'default';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsStyle = [iLevel+1,'string',['default','success','warning','danger','info','primary']];
    dSchema.itemSpace = [iLevel+2,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'label',
      className:'label', bsStyle:'default',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('bsStyle',renewKlass);
    this.defineDual('itemSpace',itemSpaceFn_);
    return state;
    
    function renewKlass(value,oldValue) {
      var sStyle = 'label-' + (this.state.bsStyle || 'default');
      var sCls = utils.setupKlass( this.state.klass,label_klass_,sStyle);
      this.duals.klass = sCls;
    }
  }
}

BS.Label_ = TLabel_;
BS.Label  = new TLabel_();

class TBadge_ extends T.Span_ {
  constructor(name,desc) {
    super(name || 'bs.Badge',desc);
    this._docUrl = bsDocUrl_;
    this._defaultProp.bsClass = 'badge';
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.pullRight = [iLevel+1,'string',boolPropmpt_];
    dSchema.itemSpace = [iLevel+2,'number'];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'badge',
      className:'badge',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    this.defineDual('pullRight',renewKlass);
    this.defineDual('itemSpace',itemSpaceFn_);
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,['pull-right'],
        this.state.pullRight && 'pull-right' );
      this.duals.klass = sCls;
    }
  }
}

BS.Badge_ = TBadge_;
BS.Badge  = new TBadge_();

var alert_klass_ = { 'alert-success':true, 'alert-warning':true,
  'alert-danger':true, 'alert-info':true, 'alert-dismissable':true,
};

class TAlert_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.Alert',desc);
    Object.assign(this._defaultProp, { bsClass:'alert', bsStyle:'info' });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.bsStyle = [iLevel+1,'string',['success','warning','danger','info']];
    dSchema.dismissable = [iLevel+2,'string',boolPropmpt_];
    dSchema.dismissed = [iLevel+3,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    return Object.assign(props, { bsClass:'alert',
      className:'rewgt-unit alert', bsStyle:'info',
    });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('role')
        .defineDual('dismissable',renewKlass);
    this.defineDual('bsStyle', function(value,oldValue) {
      this.duals.role = value || 'info';
      renewKlass.call(this);
    });
    
    this.defineDual('dismissed', function(value,oldValue) {
      this.duals.style = {display:value?'none':''};
    });
    this.closeClick_ = ( function(event) {
      this.duals.dismissed = '1';
    }).bind(this);
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      
      var insertEle = [ <div key='foo'/> ];
      if (this.state.dismissable)
        insertEle.unshift( <div key='btn'><button className='close' type='button' onClick={this.closeClick_}>x</button></div> );
      utils.setChildren(this,null,insertEle);
    });
    
    return state;
    
    function renewKlass(value,oldValue) {
      var sCls = utils.setupKlass( this.state.klass,alert_klass_,
        'alert-' + (this.state.bsStyle || 'info'),
        this.state.dismissable && 'alert-dismissable'
      );
      this.duals.klass = sCls;
    }
  }
}

BS.Alert_ = TAlert_;
BS.Alert  = new TAlert_();

BS.Progress_ = makeBsClass3_(BS.Div2_,'Progress','progress');
BS.Progress  = new BS.Progress_();

var progressbar_klass_ = { progress:true, active:true, 'progress-bar':true,
  'progress-bar-success':true, 'progress-bar-warning':true,
  'progress-bar-danger':true, 'progress-bar-info':true,
  'progress-bar-striped':true,
};

class TProgressBar_ extends BS.Div2_ {
  constructor(name,desc) {
    super(name || 'bs.ProgressBar',desc);
    if (W.__design__) this._defaultProp['data-html.opt'] = 'edit';
    Object.assign(this._defaultProp, { bsClass:'progress-bar', bsStyle:'' });
  }
  
  _getSchema(self,iLevel) {
    iLevel = iLevel || 1200;
    var dSchema = super._getSchema(self,iLevel + 200);
    dSchema.now = [iLevel+1,'number'];
    dSchema.min = [iLevel+2,'number'];
    dSchema.max = [iLevel+3,'number'];
    dSchema.bsStyle = [iLevel+4,'string',['','success','warning','danger','info']];
    dSchema.striped = [iLevel+5,'string',boolPropmpt_];
    dSchema.active = [iLevel+6,'string',boolPropmpt_];
    return dSchema;
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    if (W.__design__) props['data-html.opt'] = 'edit';
    return Object.assign(props, { bsClass:'progress-bar', bsStyle:'' });
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.stacked_ = false;
    var ownerComp = this.parentOf(true);
    if (ownerComp && ownerComp.props.bsClass == 'progress') {
      this.defineDual('role',null,'progressbar');
      this.stacked_ = true;
    }
    
    this.defineDual(['bsStyle','striped','active'],renewKlass);
    
    this.defineDual(['now','min','max'], function(value,oldValue) {
      if (this.stacked_)
        this.duals.width = getPercent(this) / 100;
    });
    
    this.defineDual('id__', function(value,oldValue) {
      if (value <= 2) return;
      if (this.stacked_) return;
      
      var sCls = this.state.bsStyle, striped = this.state.striped;
      sCls = utils.klassNames( 'progress-bar', sCls && ('progress-bar-' + sCls),
        striped && 'progress-bar-striped',
        striped && this.state.active && 'active'
      );
      
      var sTitle = safeContent(this.state['html.']);
      var dStyle = { width:getPercent(this)+'%' };
      var props = {key:'ind', role:'progressbar', style:dStyle, className:sCls};
      utils.setChildren(this,[ <div {...props}>{sTitle}</div> ]);
    });
    
    return state;
    
    function getPercent(self) {
      var iNow = parseFloat(self.state.now);
      var iMin = parseFloat(self.state.min);
      var iMax = parseFloat(self.state.max);
      
      if (isNaN(iMin)) iMin = 0;
      if (isNaN(iMax)) iMax = 100;
      if (iMax <= iMin) return 0;
      
      if (isNaN(iNow)) iNow = 0;
      iNow = Math.min(iMax,Math.max(iMin,iNow));
      return Math.floor((iNow-iMin)/(iMax-iMin) * 1000) / 10;
    }
    
    function renewKlass(value,oldValue) {
      var sCls, sCls0 = utils.clearKlass(this.state.klass,progressbar_klass_);
      if (this.stacked_) {
        var striped = this.state.striped;
        sCls = this.state.bsStyle;
        sCls = utils.klassNames( sCls0,'progress-bar', sCls && ('progress-bar-' + sCls),
          striped && 'progress-bar-striped', striped && this.state.active && 'active'
        );
      }
      else sCls = utils.klassNames(sCls0,'progress');
      this.duals.klass = sCls;
    }
  }
}

BS.ProgressBar_ = TProgressBar_;
BS.ProgressBar  = new TProgressBar_();

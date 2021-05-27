// 用来存储所有的商品信息，以及所有的商品
var selectData = {}
function init() {
    // 第一次的时候取到的为空，但是JSON.parse会返回的结果为null
    selectData = JSON.parse(localStorage.getItem("shoppingCar")) || {};
    createSelectDom();
}
//请求数据
ajax('js/shoppingData.json', function (data) {
    createGoodsDom(data);// 执行添加商品函数
    addEvent();//执行添加商品事件函数

});
// 创建商品结构函数
function createGoodsDom(data) {
    var str = '';//双重forEach循环获取里面的list数据
    data.forEach(function (item) {
        var color = '';
        item.list.forEach(function (product) {
            color += '<span data-id="' + product.id + '">' + product.color + '</span>'
        });
        str += '<tr>' +
            '<td>' +
            '<img src="' + item.list[0].img + '" />' +
            '</td>' +
            '<td>' +
            '<p>' + item.name + '</p>' +
            '<div class="color">' +
            color +
            '</div>' +
            '</td>' +
            '<td>' + item.list[0].price + '.00元</td>' +
            '<td>' +
            '<span>-</span>' +
            '<strong>0</strong>' +
            '<span>+</span>' +
            '</td>' +
            '<td><button>加入购物车</button></td>' +
            '</tr>';

    });
    // 将拼接好的字符串插入tbody标签
    document.querySelector('.product tbody').innerHTML = str;
}

// 添加商品操作事件
function addEvent() {
    var trs = document.querySelectorAll('.product tr');//获取所有行
    for (var i = 0; i < trs.length; i++) {
        action(trs[i], i);//操作每一行，每个i不表示一行
    }
    function action(tr, n) {//tr为改对象，n为第几行
        var tds = tr.children, //当前行里所有的td
            img = tds[0].children[0],//商品图片，默认展示第一张
            imgSrc = img.getAttribute('src'),//商品的地址
            name = tds[1].children[0].innerHTML,//商品的名字
            colors = tds[1].children[1].children,//所有颜色按钮
            price = parseFloat(tds[2].innerHTML),//价格
            spans = tds[3].querySelectorAll('span'),//加减按钮
            strong = tds[3].querySelector('strong'),//数量
            joinBtn = tds[4].children[0],//加入购物车的按钮
            selectNum = 0;//选中商品的数量

        // 颜色按钮的功能
        var last = null,//上次选中的按钮
            colorValue = '',//选中的颜色
            colorId = '';//选中商品对应的id
        for (var i = 0; i < colors.length; i++) {
            colors[i].index = i;
            colors[i].onclick = function () {
                // 判断上次的按钮是否为null，以及上次是否为本次，如果前两个条件成立才清空类名，
                // 为什么要判断last != this 呢？
                // 因为如果当前点击为上次点击的话，last就是this,清空last类名就是
                // 清除this类名，this类名被清除后，后面代码判断this没有类名就会
                // 给当前添加类名，起不到取出类名的效果
                last && last != this && (last.className = '');
                // 判断当前是否有类名，有就删除，没有的话添加。
                this.className = this.className ? '' : 'active';
                colorValue = this.className ? this.innerHTML : '';
                // H5设置id的方法，格式data-id="10001"，可以通过dataset.id获取id值
                colorId = this.className ? this.dataset.id : '';
                // 如果有类名，就是当前行+1（n从零开始）以及当前角标+1，没有类名，默认为当前行的第一张图片
                imgSrc = this.className ? 'images/img_0' + (n + 1) + '-' + (this.index + 1) + '.png' : 'image/img_0' + (n + 1) + '-1.png';
                img.src = imgSrc;
                // 当循环结束将这次点击的按钮该为上次last
                last = this;
            }
        }
        // - 按钮点击
        spans[0].onclick = function () {
            selectNum--;
            if (selectNum < 0) {
                selectNum = 0;
            }
            strong.innerHTML = selectNum;
        }

        // + 按钮点击
        spans[1].onclick = function () {
            selectNum++;
            strong.innerHTML = selectNum;
        }
        // 添加购物车功能
        joinBtn.onclick = function () {
            if (!colorValue) {
                alert('请选择颜色')
                return;
            }
            if (!selectNum) {
                alert('请添加购买数量');
                return;
            }
            // 给selectData对象赋值
            selectData[colorId] = {
                "id": colorId,
                "name": name,
                "color": colorValue,
                "price": price,
                "num": selectNum,
                "img": imgSrc,
                "time": new Date().getTime()//时间 用来商品排序
            }
            localStorage.setItem('shoppingCar', JSON.stringify(selectData));
            // 加入购物车后让所有已经选择的内容还原
            img.src = 'images/img_0' + (n + 1) + '-1.png';
            last.className = '';
            strong.innerHTML = selectNum = 0;
            // 存储完数据后要渲染购物车里商品的结构
            createSelectDom();
        }
    }
}

// 创建购物车商品结构
function createSelectDom() {
    var tbody = document.querySelector('.selected tbody');
    var totalPrice = document.querySelector('.selected th strong');
    var str = '';
    var total = 0; //总共多少钱
    //ES7里面的方法,用来取到对象里的所有value，并把取到的内容放到一个数组里
    var goods = Object.values(selectData);
    //对已选择的商品进行排序,如果返回数据大于0就让g2排在g1前面
    goods.sort(function (g1, g2) {
        return g2.time - g1.time;
    });
    tbody.innerHTML = '';
    for (var i = 0; i < goods.length; i++) {
        str += '<tr>' +
            '<td>' +
            '<img src="' + goods[i].img + '" />' +
            '</td>' +
            '<td>' +
            '<p>' + goods[i].name + '</p>' +
            '</td>' +
            '<td>' + goods[i].color + '</td>' +
            '<td>' + goods[i].price * goods[i].num + '.00元</td>' +
            '<td>x' + goods[i].num + '</td>' +
            '<td><button data-id="' + goods[i].id + '">删除</button></td>' +
            '</tr>';
        total += goods[i].price * goods[i].num;
    }
    tbody.innerHTML = str;
    totalPrice.innerHTML = total + '.00元';
    // 结构创建完了，添加删除功能
    del();
}
//删除功能
function del() {
	var btns = document.querySelectorAll('.selected tbody button');
	var tbody = document.querySelector('.selected tbody');

	for (var i = 0; i < btns.length; i++) {
		btns[i].onclick = function () {
			//删除对象里的数据
			delete selectData[this.dataset.id];
			localStorage.setItem('shoppingCar', JSON.stringify(selectData));

			//删除DOM结构
			tbody.removeChild(this.parentNode.parentNode);

			//更新总价格
			var totalPrice = document.querySelector('.selected th strong');
			totalPrice.innerHTML=parseFloat(totalPrice.innerHTML) - parseFloat(this.parentNode.parentNode.children[3].innerHTML)+'.00元';
		};
	}
}

//storage监听事件 当storage放生改变时会触发该函数————该方法属于window
window.addEventListener('storage',function(ev){

	console.log(ev.key);	//修改的是哪一个localstorage（名字key）
	console.log(ev.newValue);	//修改后的数据
	console.log(ev.oldValue);	//修改前的数据
	console.log(ev.storageArea);	//storage对象
	console.log(ev.url);	//返回操作的那个页面的url

	init();
});
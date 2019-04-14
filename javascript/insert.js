window.onload=function (){
	//check cookie 
	$.post("php/login.php",{action:"check"},function(data){
		if(data==0){
			document.location='login.html';
		}else{
			var object=JSON.parse(data)
			document.getElementById("username").innerHTML="Hello! "+object.username;
		}
	});
}

document.onkeydown = function (e) {
            var theEvent = window.event || e;
            var code = theEvent.keyCode || theEvent.which;
            if (code == 13) {
                insertWord(0);
            }
            if(code == 38 || code == 40){
            	var ul=document.getElementById("option");
            	var ulDisplay='';
            	if(ul.currentStyle){
            		ulDisplay=ul.currentStyle[display];
            	}else{
            		ulDisplay=getComputedStyle(ul,null)["display"];
            	}

            	if(ulDisplay=="block")
            	{
            		//正在编辑中
            		if(document.getElementById("selected"))
            		{
            			var current=document.getElementById("selected");
            			//已经有选择的了
            			$("#selected").removeAttr("id");
            			if(code==38){
            				var forward=current.previousElementSibling;
            				forward.id="selected";
            				changeInput(forward);
            			}else{
            				var next=current.nextElementSibling;
            				next.id="selected";
            				changeInput(next);
            			}
            		}else{
            			ul.firstChild.id="selected";
            			changeInput(ul.firstChild);
            		}
            	}
            }
  }
function cancel()
{
  	changeMessage("已撤回","right");
  	$("#messageBoxCancel").fadeOut();
	$("#messageBoxSubmit").fadeOut();
}

function insertWord(force){
	var word=document.getElementById("word").value;
	word=word.toLowerCase();
	var isAWord=/[a-z]+/;
	if(isAWord.test(word)){
		$.post("php/insert.php",{action:"insertPreword",word:word,force:force},function(data){
			if(isNaN(data)){
				changeMessage(data,"warning");
			}else
			{
				if(data!=0)
				{
					var message=word+" 第"+data+"次录入";
					changeMessage(message,"right");
					document.getElementById("word").value='';
					$("#messageBoxCancel").fadeOut();
					$("#messageBoxSubmit").fadeOut();
				}else
				{
					var message=word+" 似乎没有拼对，确定录入？";
					$("#messageBoxCancel").fadeIn();
					$("#messageBoxSubmit").fadeIn();
					changeMessage(message,"confirm");
				
				}
			
			}
		})

		
	}else{
		changeMessage(word+" 含有非法字符","warning");
	}

}

function changeMessage(message,type){
	document.getElementById("messageBoxP").innerHTML=message;
	if(type=="hi"){
		$("#messageBoxImg").attr("src","images/icon/maidHi.png");
	}else if(type=="warning"){
		$("#messageBoxImg").attr("src","images/icon/maidWarning.png");
	}else if(type=="confirm"){
		$("#messageBoxImg").attr("src","images/icon/maidConfirm.png");
	}else{
		$("#messageBoxImg").attr("src","images/icon/maidRight.png");
	}
}

function showTips()
{
	document.getElementById("option").innerHTML='';
	var word=document.getElementById("word").value;
	word=word.toLowerCase();
	 $.post("php/insert.php",{action:"showTips",word:word},function(data){
		if(data!=0){
			var words=JSON.parse(data);
			var li='';
			for(var i=0;i<words.length;i++){
				li+="<li onmouseover=\"changeInput(this)\" onmousedown=\"insertWord(0)\">"+words[i]+"</li>";
			}
			document.getElementById("option").innerHTML=li;
		}
	 });
}

function changeInput(li){
	var word=li.innerHTML;
	document.getElementById("word").value=word;
}

function showUL(){
	$('#option').fadeIn();
}
function hideUL(){
	$('#option').fadeOut();
}
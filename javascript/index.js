 
window.onload=function (){
	//check cookie 
	$.post("php/login.php",{action:"check"},function(data){
		if(data==0){
			document.location='login.html';
		}else{
			var object=JSON.parse(data)
			document.getElementById("username").innerHTML="Hello! "+object.username;
			var words=object.words;
			var amount=object.amount;
			var finished=object.finished;
			var times=Math.ceil(words/amount);
			//setPlan
			for (var i = 1; i <=finished; i++) {
				$('#planUL').append("<li><img src=\"images/icon/finish.png\"><h6>第"+i+"次</h6></li>");
			}	
			finished++;

			for(var i=finished;i<=times;i++){
				$('#planUL').append("<li><p>"+amount+"</p><h6>第"+i+"次</h6></li>");
			}
			changePlan.words=words;
			//setPlan in the setPlan Board
			document.getElementById("setPlanTimes").value=amount;
			document.getElementById("currentWord").innerHTML="· 背诵计划中现有<em>"+words+"</em>个单词";
			document.getElementById("currentPlan").innerHTML="· 每周背诵<em>"+times+"</em>次";
		}
	});
}

function showSetPlan(){
	$('#setPlan').fadeIn(1000);
	$("#background").fadeIn(1000);
}
function hideSetPlan(){
	$('#setPlan').fadeOut(1000);
	$("#background").fadeOut(1000);
}

function updatePlan(){
	var amount=document.getElementById("setPlanTimes").value;
	$.post("php/index.php",{action:"updatePlan",amount:amount},function(data){
		if(data==1){
			showMessage("设置成功","right");
			hideSetPlan();
		}else{
			showMessage(data,"warning");
		}

	});
}
function getWords(){
	$.post("php/index.php",{action:"getWords"},function(data){
		if(isNaN(data)){
			showMessage(data,"warning");
			return 0;
		}else{
			changePlan.words=data;
			return 1;
		}
	})

}
var changePlan=function(){
	var p=document.getElementById("currentPlan");
	var times=document.getElementById("setPlanTimes").value;
	console.log(changePlan.words);
	var days= Math.ceil(changePlan.words/parseInt(times));
	p.innerHTML="· 每周背诵<em>"+days+"</em>次</h5>";
}

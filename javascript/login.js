function login(){
	var username=document.getElementById('username').value;
	var password=document.getElementById('password').value;
	console.log(password);
	console.log(username);
	if(username==''||password==''){
			showMessage("用户名或密码不能为空","warning");
	}
	$.post("php/login.php",{username:username,password:password,action:"login"},function(data){
		console.log(data);
		if(data==1){
			document.location="index.html"
		}else{
			showMessage(data,"warning");
		}
		
	});
}



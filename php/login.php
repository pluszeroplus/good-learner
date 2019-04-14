<?php 
 $action=isset($_POST['action'])?$_POST['action']:'';
 if($action=="login")
 {	
 	require('connect.php');

 	$username=$_POST['username']?$_POST['username']:'';
 	$password=$_POST['password']?$_POST['password']:'';
 	$sql="select password  from user where username='$username'";
 	$result=mysqli_query($conn,$sql);
 	if(mysqli_affected_rows($conn)==1){
 		
 		$result=mysqli_query($conn,$sql);
 		$row=mysqli_fetch_assoc($result);
 		$pw=$row['password'];
 		if(password_verify($password,$pw))
 		{	
 			$sql="select id from user where username='$username'";
 			$result=mysqli_query($conn,$sql);
 			
 			$row=mysqli_fetch_assoc($result);
 			$id=$row['id'];
			$section = substr(md5(time()), 0, 31);
			$sql="update user set section='$section' where id = $id";
			if(mysqli_query($conn,$sql)){
				setcookie("userid", $id, time()+3600*3);
				setcookie("section", $section, time()+3600*3);
				echo 1;

			}else {
				echo mysqli_error($conn);
			}
 			
		}else
		{
			echo "密码错了吧";
		}
	}else		
 	{
 			echo "用户名错了哦";
 	}
 }else if($action=="check"){
 	include'public.php';
 	checkUser();
 }
 	
 	
 	
 	 

 	 
 
  ?>
<?php 
	header("Content-type: text/html; charset=utf-8");

	$servername="localhost";
	$username="##";
	$password="##";
	
	$conn=mysqli_connect($servername,$username,$password,"goodlearner");
	// $conn=mysqli_connect($servername,$username,$password,"englishstudy");
	mysqli_query($conn,"set character set 'utf8'");//读库
	if(!$conn){
		echo mysqli_connect_error($conn);
	}else{
		// echo "连接成功";
	}
 ?>

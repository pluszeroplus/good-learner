<?php 
	

	require('connect.php');
	$username="test1";
	$password="123";
	$pw=password_hash ($password , PASSWORD_DEFAULT);
	$sql="insert into user values(null,'$username','$pw','1','3','15')";
	if (mysqli_query($conn, $sql)) {
    	echo $username."插入成功</br>";
	} else {
    	echo "Error: " . $sql . "<br>" . mysqli_error($conn)."</br>";
	}	
	
 ?>
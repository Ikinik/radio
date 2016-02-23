<?php
if(!($_POST['user'] == 'hackme' && $_POST['pass'] == 'hackme')){
	header('icecast-auth-user: 0');
	exit();
}else{
	header('icecast-auth-user: 1');
	exit();
}
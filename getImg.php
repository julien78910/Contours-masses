<?php
$dir    = 'userImg/';
$files = array_diff(scandir($dir), array('.', '..'));


foreach ($files as $img) {
    echo $img . " ";
}
?>

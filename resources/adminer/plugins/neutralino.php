<?php

/** Adds NeutralinoJS script to Adminer
* @link https://www.adminer.org/plugins/#use
* @uses NeutralinoJS, https://neutralino.js.org/
* @author Ano Rebel, https://www.github.com/AnoRebel
* @license https://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
* @license https://www.gnu.org/licenses/gpl-2.0.html GNU General Public License, version 2 (one or other)
*/
class AdminerNeutralino {
/** @access protected */
	var $paths;

	/**
	* @param Array
	*/
	function __construct($paths = array("neutralino" => "../js/neutralino.js", "custom" => "index.js")) {
		$this->paths = $paths;
	}
	function head() {
		// foreach($paths as $name => $path) {
		// 	echo script_src($path);
		// }
		?>
		<script src="../js/neutralino.js"></script>
    	<script src="index.js"></script>
    	<?php
	}
}
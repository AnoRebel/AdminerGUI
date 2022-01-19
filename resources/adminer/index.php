<?php
function adminer_object()
{
    // required to run any plugin
    include_once "./plugins/plugin.php";

    // autoloader
    foreach (glob("plugins/*.php") as $filename) {
        include_once "./$filename";
    }

    // enable extra drivers just by including them
    //~ include "./plugins/drivers/simpledb.php";

    $plugins = array(
        // specify enabled plugins here
        new AdminerNeutralino(),
        new AdminerDumpJson(),
        new AdminerJsonColumn(),
        new AdminerEditForeign(),
        new AdminerTinymce(),
        new AdminerEditTextarea(),
        new AdminerEnumOption(),
        new AdminerEnumTypes(),
        new AdminerFileUpload("data/"),
        new AdminerSlugify(),
        new AdminerForeignSystem(),
        new AdminerSqlLog(),
        new AdminerDumpAlter(),
        // new AdminerDesigns(),
    );

    /* It is possible to combine customization and plugins:
    class AdminerCustomization extends AdminerPlugin {
    }
    return new AdminerCustomization($plugins);
    */

    return new AdminerPlugin($plugins);
}

// include original Adminer or Adminer Editor
include "./adminer.php";
?>

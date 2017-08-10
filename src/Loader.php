<?php

namespace Taco\AddMany;

use \FrontendLoader\FrontendLoader;
require __DIR__.'/SubPost.php';

class Loader
{

    public static function init()
    {
        add_action('admin_head', '\Taco\AddMany\AddMany::init');
        add_action('admin_enqueue_scripts', function() {
            require_once(get_home_path() . 'wp-includes/class-wp-editor.php');
            \_WP_Editors::enqueue_default_editor();
        });
        add_action('wp_ajax_AJAXSubmit', '\Taco\AddMany\AddMany::AJAXSubmit');
        add_action('save_post', '\Taco\AddMany\AddMany::saveAll');
        add_filter('parse_query', function($query) {
          $front_end_loader = new FrontendLoader(
           realpath(dirname(__FILE__).'/../'),
           'addons',
           'dist'
          );
          $front_end_loader->fileServe($query);
          return $query;
        });
        return true;
    }
}

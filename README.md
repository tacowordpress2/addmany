# AddMany:
In simplest terms allows relationships between posts.
The visual interface gives WordPress admin the ability to assign one-to-many relationships with children that share no other parents. You can also allow many-to-many relationships where children may have many parents and vice versa. You can even create shared fields between parent and children which is important for things like products that may change price at different store locations. More on that later.

Similar to ACF (Advanced Custom Fields), AddMany has the ability to create and repeat sets of fields. The main difference being, it puts control back into the hands of the developer and allows you to write custom MySQL queries if need be.

### Table of Contents

* [Use Cases](https://github.com/tacowordpress/addmany/blob/master/README.md#use-cases)
* [How it works](https://github.com/tacowordpress/addmany/blob/master/README.md#how-it-works)
* [Requirements](https://github.com/tacowordpress/addmany/blob/master/README.md#requirements)
* [Installation](https://github.com/tacowordpress/addmany/blob/master/README.md#installation)
* [Example Usage](https://github.com/tacowordpress/addmany/blob/master/README.md#example-usage)
  * [One-to-many](https://github.com/tacowordpress/addmany/blob/master/README.md#one-to-many)
  * [Many-to-many](https://github.com/tacowordpress/addmany/blob/master/README.md#many-to-many-addbysearch)
  * [Many-to-many with shared fields](https://github.com/tacowordpress/addmany/blob/master/README.md#many-to-many-with-unique-common-fields-between-2-posts-like-a-junction-table)
  * [One-to-many with field variations](https://github.com/tacowordpress/addmany/blob/master/README.md#one-to-many-with-field-variations)
  * [One-to-one](https://github.com/tacowordpress/addmany/blob/master/README.md#one-to-one)
* [Getting a posts relations in your template](https://github.com/tacowordpress/addmany/blob/master/README.md#getting-a-posts-relations)
* [Ordering](https://github.com/tacowordpress/addmany/blob/master/README.md#ordering---what-if-i-just-want-that)
* [Advanced - Getting original values of Many-to-Many Shared fields](https://github.com/tacowordpress/addmany/blob/master/README.md#getting-original-values-of-a-referenced-post-if-overwritten)
* [WordPress AddMany UI Customization](https://github.com/tacowordpress/addmany/blob/master/README.md#customizing-how-search-results-get-returned-in-the-ui)
* [UI - Defining what shows when rows are collapsed](https://github.com/tacowordpress/addmany/blob/master/README.md#ui---defining-what-shows-when-rows-are-collapsed)
* [Convenience Methods](https://github.com/tacowordpress/addmany/blob/master/README.md#convenience-methods)



## Use Cases
 * relate posts to other posts
 * control the order of posts (custom post types)
 * assign modules or panels to a layout that are customizable
 * repeat an arbitrary number of fields (like ACF repeater)
 * overriding a post(s) fields on a case by case basis without affecting the original
 * keeps context by allowing you to create child posts on the same page

## How it Works

**Related Posts**

<img src="https://raw.githubusercontent.com/tacowordpress/addmany/master/docs/img/doc-img-1.png" width="400"/>

**What happens behind the scenes**

<img src="https://raw.githubusercontent.com/tacowordpress/addmany/master/docs/img/doc-img-2.png" width="600"/>

**Why is there a "Subpost" between my current post and the related post? What is a SubPost?**

It would probably be helpful to explain what a "SubPost" is. It is a custom post type that sits between the post and the related post. It's hidden from the WordPress admin menus but you're actually seeing as a row whenever you add a related post in the UI.

**There are a number of important reasons why AddMany uses a SubPost:**

* They allow a unique set of fields to be assigned between the post and related post
* Different relationship types can be assgined like one-to-many, many-to-many, one-to-one, etc.
* Can be queried via MySQL
* Because a Subpost utilizies the existing WordPress database structure no additional tables need to created.



## Requirements

AddMany would not be possible without [The TacoWordPress framework – An ORM for custom post types.](https://github.com/tacowordpress/tacowordpress) This is a requirement.

###### Other requirements:
 * PHP >= 5.4
 * Knowledge of requiring packages through Composer
 * Prior knowledge of TacoWordpress
 * Object-oriented programming

###### Built with [React](https://facebook.github.io/react/) and PHP

## Installation
Depending on where you put your project's vendor directory, installation may or may not work. A solution is currently being worked on to resolve this.

In your project's composer.json file, add the packages below in the require section:

```
"require": {
  "tacowordpress/tacowordpress": "dev-master",
  "tacowordpress/addmany": "dev-master",
  "tacowordpress/util": "dev-master"
}
```
Run `composer update` or `composer install` in the terminal.

In your theme's function file, add the below:
```php

// Add this so your project has access to Composer's autoloaded files.
// Please replace "{path_to_autolaod}".
require_once '{path_to_autoload}/autoload.php';

// Make sure to initialize the core dependency of AddMany, "TacoWordPress".
\Taco\Loader::init();

// Initialize AddMany
\Taco\AddMany\Loader::init();

```

## Example Usage
With the examples below, you should have prior knowledge of how TacoWordPress works. If not, please consult the docs here:
https://github.com/tacowordpress/tacowordpress/wiki.

### One-to-Many
```php

// Example configuration for a basic AddMany Field

  public function getFields() {
    return [
      'staff_members' => \Taco\AddMany\Factory::create(
        [
          'first_name' => ['type' => 'text'],
          'last_name' => ['type' => 'text'],
          'bio' => ['type' => 'textarea']
        ],
        ['limit_range' => [2, 3]] // Enforce a minimum of 2 items, but no more than 3.
       )->toArray()
    ];
  }
```

### Many-to-Many (AddBySearch)

```php
// Example configuration for an AddMany field with AddBySearch
// Adds a search field for querying posts via AJAX

  public function getFields() {
    return [
      'employees' => \Taco\AddMany\Factory::createWithAddBySearch('Employee')->toArray()
    ];
  }
 ```

### Many-to-Many with unique common fields between 2 posts (like a junction table)
In this example, the shared fields are between the parent post and the child posts of "products".
 ```php
// Example AddBySearch with shared fields

class Store extends \Taco\Post {
  public function getFields() {
    return [
      'products' => \Taco\AddMany\Factory::createWithAddBySearch('Product',[
        'price' => ['type' => 'text'],
        'tax' => ['type' => 'text']
      ])->toArray()
    ];
  }
 }
 ```
 Because the above will reference external "product" posts, you have the ability to extend their values ("price" and "tax" is a good use case) while also keeping their original values. This is useful for creating products and allowing them to slightly vary between stores.



### One-to-Many with field variations

Field variations allow the admin user to select and add a combination of different field groups. This allows for more customization of layouts. An example might be a sidebar that has many different modules. Each module would have a different set of fields that control the content, look, and feel. Another example (featured below) might be a staff page with a grid of photos and information for each person. Instead of the layout being separated by staff member type, they are mixed together. You could create 1 field group with all the fields necessary to satifsy both staff member types, but that might cause some field bloat. With fields variations, you can create one field group for board members and another for general staff while keeping them together in the same grid.

 ```php

// Example AddMany field with field variations – Adds a dropdown for users to select

  public function getFields() {
    return [
      'staff_members' => \Taco\AddMany\Factory::create(
        [
          'board_members' => [
            'first_name' => ['type' => 'text'],
            'last_name' => ['type' => 'text'],
            'bio' => ['type' => 'textarea']
          ],
          'general_staff' => [
            'first_name' => ['type' => 'text'],
            'last_name' => ['type' => 'text'],
            'department' => ['type' => 'select', 'options' => $this->getDepartments()]
          ],
        ]
       )->toArray()
    ];
  }
```

### One-to-One
```php

// You can simulate a one-to-one relationship by limiting the number of items to 1

class Person extends \Taco\Post {
  public function getFields() {
    return [
      'spouse' => \Taco\AddMany\Factory::create(
        [
          'first_name' => ['type' => 'text'],
          'phone' => ['type' => 'text']
        ],
        ['limit_range' => [0, 1]] // Do not allow more than 1 item to be added
       )->toArray()
    ];
  }
 }
```


## Getting a post's relations


In your template you can get related posts by accessing the field name through your object,
e.g. ```$blog_post->related_posts```
This will return a collection of post objects.

In order to utilize the above, you must use the AddMany Mixin within your class.

```php

class Post extends \Taco\Post {
  use \Taco\AddMany\Mixins;
  ...
```
This will let you do the following:

```php
// In your template (Example)

$blog_post = \Taco\Post\Factory::create($post); ?>

<?php foreach($blog_post->related_posts as $rp): ?>
   <?= $rp->post_title; ?>
  ...
<?php endforeach; ?>

```
###### What if no related posts exist in the object?
In other words, the admin did not manually select them.
You can define a fallback method. This will alow for cleaner code in your template by removing any logic.

This example shows a method that is defined in the Post class:
```php
  public function getFallBackRelatedPosts($key) {
    global $post;
    $post_id = (is_object($post) && isset($post->ID))
      ? $post->ID
      : null;
    if($key === 'related_posts') {
      return \Taco\Post::getWhere(['posts_per_page' => 3, 'exclude' => $post_id]);
      // The above actually just gets the 3 most recent posts, excluding the current one.
      // This is a poor example. Don't be this lazy!
    }
  }
```

## Ordering - What if I just want that?
You can do that too!
```php
public function getFields() {
  return [
    'videos' => \Taco\AddMany\Factory::createAndGetWithAddBySearch('GalleryItem', null, [
    'uses_ordering' => true
  ]);
];
```
Specifing ordering by "uses_ordering => true" removes the ability to search posts and instead adds all records for that post type. This gives the admin user the ability to order by drag and drop. Be careful though, AddMany will create a new subpost for published posts in the the database (of that post type). In some cases your better off using this feature to order smaller subsets of data. See the ["Customizing how search results get returned in the UI"](https://github.com/tacowordpress/addmany/blob/master/README.md#customizing-how-search-results-get-returned-in-the-ui) for how.


IMPORTANT: The method you define must be named "getFallBackRelatedPosts". It can handle more than one field if you allow it. Just create a switch statement or some logic to check the key and then return the appropriate posts.


## Getting original values of a referenced post if overwritten
With AddMany you can override values from a post that you reference through AddBySearch. This is extremely useful if you have a template (of some sort) or even a product that may need its values replaced without having to recreate it.

Let's say there are a chain of stores that all carry the same product/s but the prices vary from location to location.
The following code will allow this:

```php

class Store extends \Taco\Post {
  use \Taco\AddMany\Mixins;

  public function getFields() {
    return [
      'products' => \Taco\AddMany\Factory::createWithAddBySearch('Product', [
        'price' => ['type' => 'text']
      ])->toArray()
    ];
  }
  ...
```

The admin interface will give you the ability to find and add the products to a list. This list will contain the products with an additional field of "price". Typing a value in these fields will override it but not replace the original.

To understand this concept better, let's create the template code that displays some basic product information.

```php
/* Single Store - single-store.php */
<?php $store = Store::find($post->ID); // load the store and iterate through the products

foreach($store->products as $product): ?>
  Product title: <?= $product->getTheTitle(); ?><br>
  product price: $<?= $product->get('price'); ?><br>
  Original price: $<?= $product->original_fields->price; ?> <br>
  Savings: $<?= $product->original_fields->price - $product->get('price'); ?><br><br>
<?php endforeach; ?>
```
By accessing the property of "original_fields", you will get the original value while keeping the new value.
`$product->original_fields->price;`

This is also useful to show product savings after a reduction in price.

## Customizing how search results get returned in the UI
If you're using the AddMany's AddbySearch functionality to query and assign related posts, there is a chance you need to narrow the results even further. Let's say you wanted to return posts of the custom post type person that have a term of "employee" but there are hundreds of people to pick from. You can create your own method to make the results more definitive. By default, the AddMany core method looks like this:

```php
  public static function getPairsWithKeyWords($keywords, $post_type_class_name) {
    $post_type = Str::machine(Str::camelToHuman($post_type_class_name), '-');

    $query = new \WP_Query([
      'post_type' => $post_type,
      's' => $keywords,
      'posts_per_page' => -1
    ]);

    $results = [];
    foreach ($query->posts as $post) {
      $results[$post->ID] = $post->post_title;
    }

    return $results;
  }
```
######  Creating your own method
We will use the example above where the UI needs to return posts of the custom post type person with a term of "employee" of the taxonony (slug) "person-type".

```php
 public static function getEmployees($keywords, $post_type_class_name) {
      $post_type = Str::machine(Str::camelToHuman($post_type_class_name), '-');

      $query = new \WP_Query([
          'post_type' => 'person',
          's' => $keywords,
          'tax_query' => [
              [
                  'taxonomy' => 'person-type',
                  'field'    => 'slug',
                  'terms'    => 'employee'
              ],
          ),
          'posts_per_page' => -1
      ]);

      $results = [];
      foreach ($query->posts as $post) {
          $results[$post->ID] = $post->post_title;
      }
      return $results;
  }
```
*Note*: It's important to keep the text querying ("s" property) in the WP_Query so the user admin can still search with keywords. Also, when returning an array, the key is required to be the post ID and value "should" be the post title but that isn't totally necessary.

Next we need assign this method in "getFields()".

```php
public function getFields() {
  return [
    'products' => \Taco\AddMany\Factory::createWithAddBySearch('Person::getEmployees')
  ];
}
```
In the above code "Person" is the post type class name and "getEmployees" is the new method we just created above.


## UI - Defining what shows when rows are collapsed
Reordering via drag and drop can be cumbersome when the height of rows grow and takes up most of the screen. A collapse button has been provided to decrease the height of these items. This creates an issue of what to show when the height of rows are shortened. By default, AddMany shows a collection of truncated field values from a row to give the admin user an easier task of identifying which is which. You can also specify via code which field value shows, by adding the field name for the key of "show_on_collapsed" in the options part of the array.

Here's an example how.

```php

public function getFields() {
  return [
    'right_column_images' => \Taco\AddMany\Factory::create([
      'image' => ['type' => 'image']
    ], ['show_on_collapsed' => 'image'])->toArray()
  ];
)'
```


## Convenience methods
The Factory class of AddMany has a few convenience methods to make your code just a little cleaner:

Basic AddMany
`\Taco\AddMany\createAndGet()` will return the array without having to call `->toArray()`

AddMany with AddBySearch

`\Taco\AddMany\createAndGetWithAddBySearch()` will also return an array


## Contributing (Coming soon)


## Changelog

### v0.2
Adding Visual and Text tabs to WYSIWYGs

### v0.1
Initial branch of addmany
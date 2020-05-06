/*
* These scripts will be used for various purposes
*/

$(function()  {
  // This script will change the text area with an editor
  if ($('textarea#ta').length) {
     CKEDITOR.replace('ta');
  }

  // This script will show a dialog box when deleting a page
  $('a.confirmDeletion').on('click', (e)  =>  {
      if (!confirm('Confirm deletion ')) return false;
  });

  // Activate the fancybox plugin to view gallery images for each product
  if ($("[data-fancybox]").length)  {
      $("[data-fancybox]").fancybox();
  }


});

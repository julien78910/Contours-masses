function masquer_div(id)
{
  if (document.getElementById(id).style.display == 'none')
  {
       document.getElementById(id).style.display = 'block';
  }
  else
  {
       document.getElementById(id).style.display = 'none';
  }
}



function apparition_div(id)
{
  if (document.getElementById(id).style.display == 'block')
  {
       document.getElementById(id).style.display = 'none';
  }
  else
  {
       document.getElementById(id).style.display = 'block';
  }
}



 function changeText(text){
   if (text === 'info-outils-un'){
   $('.info-outils').html('Ceci est votre pinceau virtuel');
   }
   if (text === 'info-outils-deux'){
   $('.info-outils').html('Après avoir repassé, secouez la tablette');
   }
   if (text === 'info-outils-trois'){
   $('.info-outils').html('Repassez et laissez le bruit agir');
   }
   if (text === 'info-outils-quatre'){
   $('.info-outils').html("Maintenez la pression du doigt sur l'écran");
   }
 }



$(document).ready(function(){
    $('#article').click(
        function(e)
        {
            $('#article').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    );
});

$(document).ready(function(){
    $('#masquer').click(
        function(e)
        {
            $('#masquer').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    );
});



$(document).ready(function(){
    $('#outils').click(
        function(e)
        {
            $('#outils').removeClass('youhou');
            $(e.currentTarget).addClass('youhou');
        }
    );
});

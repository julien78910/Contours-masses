

angular.module('app', [])

.controller('appController', function($scope) {

  $scope.data = {

    img: []

  };



  function getImg() {

    var result = "";

    $.ajax({

      url: "https://jeremylorent.fr/getImg.php",

      type: 'GET',

      dataType: 'text',

      success: function (data) {

        result = data.split(" ");



        for (var i = 0; i < result.length - 1; ++i) {

          var img = result[i];


          $scope.data.img.push("https://jeremylorent.fr/userImg/" + img);

        }

      },

      async: false

    });

  }

  getImg();



});
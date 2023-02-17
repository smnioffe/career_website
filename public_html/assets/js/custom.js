
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });


    $('.ti-linkedin').click(function(e) {
        e.preventDefault(); // prevent the default link behavior
        window.open('https://www.linkedin.com/in/simonioffe/'); // open the URL in a new tab
      });
      
      // Handle clicks on .ti-github
      $('.ti-github').click(function(e) {
        e.preventDefault(); // prevent the default link behavior
        window.open('https://github.com/smnioffe'); // open the URL in a new tab
      });



});

// protfolio filters
$(window).on("load", function() {
    var t = $(".portfolio-container");
    t.isotope({
        filter: ".start-item",
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: !1
        }
    }), $(".filters a").click(function() {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var i = $(this).attr("data-filter");
        return t.isotope({
            filter: i,
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: !1
            }
        }), !1
    });
});



document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebar");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");

    if (mobileMenuBtn && sidebar) {

        mobileMenuBtn.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });

    }


    /*
     * Close mobile sidebar when clicking outside it
     */

    document.addEventListener("click", function (event) {

        if (!sidebar || !sidebar.classList.contains("open")) {
            return;
        }

        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedMenuButton =
            mobileMenuBtn &&
            mobileMenuBtn.contains(event.target);

        if (!clickedInsideSidebar && !clickedMenuButton) {

            sidebar.classList.remove("open");

        }

    });


    /*
     * Close sidebar when navigating on mobile
     */

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            if (window.innerWidth <= 800) {

                sidebar.classList.remove("open");

            }

        });

    });

});
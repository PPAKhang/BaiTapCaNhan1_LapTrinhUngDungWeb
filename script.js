$(document).ready(function() {
    
    //tính năng cho drag&drop
    $('#dropdown-display').on('click', function(e) {
        e.stopPropagation();
        $('#thumbnail-palette').toggleClass('hidden');
        $(this).toggleClass('active');
    });


    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown-wrapper').length) {
            $('#thumbnail-palette').addClass('hidden');
        }
    });


    $('.drag-item-thumb').on('click', function(e) {
        e.stopPropagation(); 
        const imgSrc = $(this).attr('src');

        $('#selected-image').attr('src', imgSrc);
        $('#thumbnail-palette').addClass('hidden');

        const newImg = $('<img src="' + imgSrc + '" class="drag-item">');
        $('#image-area').append(newImg);

        enableDrag(newImg);
    });


    function enableDrag($img) {
        let isDragging = false;
        let offsetX, offsetY;

        $img.on('mousedown', function(e) {
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            $(this).addClass('dragging');
        });

        $(document).on('mouseup', function() {
            isDragging = false;
            $('.dragging').removeClass('dragging');
        });

 
        $(document).on('mousemove', function(e) {
            if (isDragging) {
                const containerOffset = $('#image-area').offset();
                const x = e.pageX - containerOffset.left - offsetX;
                const y = e.pageY - containerOffset.top - offsetY;

                $('.dragging').css({
                    left: x + 'px',
                    top: y + 'px'
                });
            }
        });
    }

    //đồng bộ footer và nav

    const $menuItems = $('.menu-item');
    const $activeStatus = $('#active-status');

  
    function setActiveMenu(menuId, menuText) {
  
        $menuItems.removeClass('active');
        $menuItems.filter(`[data-menu-id="${menuId}"]`).addClass('active');

        if ($activeStatus.length) {
            $activeStatus.text(`Đang xem: ${menuText}`);
        }
    }

    $menuItems.on('click', function(e) {
        e.preventDefault(); 
        
        const $clickedItem = $(this);
        const menuId = $clickedItem.data('menu-id'); 
        const menuText = $clickedItem.text();       
        
        setActiveMenu(menuId, menuText);
    });

    const initialActiveItem = $('.menu-item.active').first();
    if (initialActiveItem.length) {
        setActiveMenu(initialActiveItem.data('menu-id'), initialActiveItem.text());
    }


});

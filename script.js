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

    //đóng mở new của side bar
    $('.news-content').each(function() {
        if (!$(this).hasClass('open')) {
            $(this).addClass('closed');
            $(this).closest('.news-card').addClass('closed');
        }
    });

    $('.news-header').on('click', function() {

        const $newsCard = $(this).closest('.news-card');
        const $newsContent = $newsCard.find('.news-content');

        if ($newsCard.hasClass('closed')) {
            $newsContent.removeClass('closed').addClass('open');
            $newsCard.removeClass('closed');
        } else {
            $newsContent.removeClass('open').addClass('closed');
            $newsCard.addClass('closed');
        }
    });

    //kéo thả cho news của sidebar thay đổi vị trí
    let isDragging = false;
    let $draggedItem = null;
    let originalY;
    let offset;
    let $sidebar = $('#sidebar');
    

    $sidebar.on('mousedown', '.news-card', function(e) {
        if (e.button !== 0) return; 

        isDragging = true;
        $draggedItem = $(this);
        
        originalY = $draggedItem.offset().top;
        offset = e.clientY - originalY;
        
        $draggedItem.addClass('dragging-placeholder').before($draggedItem.clone().addClass('dragging-clone'));
        
        $draggedItem.css({
            position: 'absolute',
            zIndex: 1000,
            width: $draggedItem.outerWidth() + 'px',
            cursor: 'grabbing',
            top: e.clientY - offset + 'px',
            left: $draggedItem.offset().left + 'px',
            opacity: 0.8
        });

        e.preventDefault(); 
    });

    $(document).on('mousemove', function(e) {
        if (!isDragging) return;

        $draggedItem.css('top', e.clientY - offset + 'px');
        let draggedCenterY = e.clientY - offset + $draggedItem.outerHeight() / 2;
        
        $('.news-card:not(.dragging-placeholder)').each(function() {
            let $current = $(this);
            let currentTop = $current.offset().top;
            let currentBottom = currentTop + $current.outerHeight();

            if (draggedCenterY < currentTop + $current.outerHeight() / 2) {
                if ($draggedItem.next().hasClass('dragging-placeholder')) {
                    $draggedItem.next().after($current);
                } else {

                    $current.before($('.dragging-placeholder'));
                }
                return false; 
            }

            if (draggedCenterY > currentBottom - $current.outerHeight() / 2) {
                 if ($draggedItem.prev().hasClass('dragging-placeholder')) {
                    
                    $draggedItem.prev().before($current);
                 } else {
                    $current.after($('.dragging-placeholder'));
                 }
                return false;
            }
        });
    });

    $(document).on('mouseup', function() {
        if (!isDragging) return;

        isDragging = false;
        
        // Đưa phần tử kéo vào vị trí placeholder
        $draggedItem.removeClass('dragging-clone').removeAttr('style');
        $('.dragging-placeholder').replaceWith($draggedItem);
        
        // Dọn dẹp
        $draggedItem.removeClass('dragging-placeholder');
        $draggedItem.css({ position: '', zIndex: '', width: '', cursor: '', top: '', left: '', opacity: '' });
        $draggedItem = null;
    });

});

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
    let isDraggingSidebar = false;
let $draggedNewsItem = null;
let offsetNewsY;
let $sidebar = $('#sidebar');

$sidebar.on('mousedown', '.news-card', function(e) {

    if (e.button !== 0 || $(e.target).closest('.news-header').length === 0) return;
    
    isDraggingSidebar = true;
    $draggedNewsItem = $(this);
    

    let itemOffset = $draggedNewsItem.offset();
    offsetNewsY = e.clientY - itemOffset.top;
    

    let $clone = $draggedNewsItem.clone().addClass('dragging-clone');
    $draggedNewsItem.addClass('dragging-placeholder');
    $draggedNewsItem.after($clone); 
    
    $clone.css({
        position: 'absolute',
        zIndex: 1000,
        width: $draggedNewsItem.outerWidth() + 'px',
        cursor: 'grabbing',
        top: e.clientY - offsetNewsY + 'px',
        left: itemOffset.left + 'px',
        opacity: 0.8,
        height: $draggedNewsItem.outerHeight() + 'px' 
    });

    $clone.data('isDragging', true); 

    e.preventDefault(); 
});

$(document).on('mousemove', function(e) {
    if (!isDraggingSidebar) return;

    let $clone = $sidebar.find('.dragging-clone');
    $clone.css('top', e.clientY - offsetNewsY + 'px');

    let cloneCenterY = e.clientY - offsetNewsY + $clone.outerHeight() / 2;
    
    $sidebar.find('.news-card:not(.dragging-placeholder)').each(function() {
        let $current = $(this);
        let currentTop = $current.offset().top;
        let currentHeight = $current.outerHeight();
        let currentCenterY = currentTop + currentHeight / 2;

        if (cloneCenterY < currentCenterY) {
            $current.before($draggedNewsItem);
            return false; 
        } else if (cloneCenterY > currentCenterY) {
            $current.after($draggedNewsItem);
        }
    });
});

$(document).on('mouseup', function() {
    if (!isDraggingSidebar) return;

    isDraggingSidebar = false;
    
    let $clone = $sidebar.find('.dragging-clone');
    
    $clone.before($draggedNewsItem.removeClass('dragging-placeholder'));
    
    $clone.remove();
    $draggedNewsItem.removeAttr('style').removeClass('dragging-placeholder');
    $draggedNewsItem = null;
});


$sidebar.on('click', '.news-card', function(e) {
    let $clone = $sidebar.find('.dragging-clone');
    if ($clone.length) {
        e.stopImmediatePropagation();
        return false;
    }
});

});

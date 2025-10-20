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
            if (e.button !== 0) return; 

            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            
  
            $(this).css({
                position: 'absolute',
                zIndex: 9999,
                cursor: 'grabbing'
            }).addClass('dragging');
            
            e.preventDefault(); 
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

        $(document).on('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                
                // Loại bỏ các style kéo và class
                $('.dragging').css({
                    zIndex: 1,
                    cursor: 'grab'
                }).removeClass('dragging');
            }
        });
    }

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

    $('.news-content').each(function() {
        if (!$(this).hasClass('open')) {
            $(this).addClass('closed');
            $(this).closest('.news-card').addClass('closed');
        }
    });

    let isDraggingSidebar = false;
    let $draggedNewsItem = null;
    let offsetNewsY;
    let initialLeft;
    let $sidebar = $('#sidebar');
    let $placeholder = null;
    let startY = 0; 
    let dragThreshold = 5; // Ngưỡng pixel để coi là đang kéo

    $sidebar.on('mousedown', '.news-header', function(e) {
        if (e.button !== 0) return;
    
        startY = e.clientY;
        isDraggingSidebar = true;
        $draggedNewsItem = $(this).closest('.news-card');
    
        let cardOffset = $draggedNewsItem.offset();
        offsetNewsY = e.pageY - cardOffset.top;
        
        initialLeft = cardOffset.left;

        e.preventDefault(); 
    });

    $(document).on('mousemove', function(e) {
        if (!isDraggingSidebar || !$draggedNewsItem) return;

        let distance = Math.abs(e.clientY - startY);

        if (distance > dragThreshold && !$placeholder) {

            $draggedNewsItem.data('is-dragging', true);

            $placeholder = $('<div></div>').addClass('dragging-placeholder').css({
                'height': $draggedNewsItem.outerHeight() + 'px',
                'marginBottom': $draggedNewsItem.css('marginBottom'),
                'marginTop': $draggedNewsItem.css('marginTop'),
                'border': '1px dashed #aaa',
                'backgroundColor': '#f9f9f9',
                'borderRadius': '4px'
            });
        
            let $clone = $draggedNewsItem.clone().addClass('dragging-clone');
            
            $draggedNewsItem.after($placeholder);
            $draggedNewsItem.detach(); 
            
            
            $sidebar.css('position', 'relative'); 
            $sidebar.append($clone);

            
            let sidebarOffset = $sidebar.offset();
            
            $clone.css({
                position: 'absolute',
                zIndex: 1000,
                width: $placeholder.outerWidth() + 'px', 
                cursor: 'grabbing',
                top: (e.pageY - sidebarOffset.top - offsetNewsY) + 'px',
                left: '0px', 
                opacity: 0.8,
                'box-shadow': '0 4px 10px rgba(0, 0, 0, 0.2)' 
            });
        }

        
        if ($placeholder) {
            let $clone = $sidebar.find('.dragging-clone');
            let sidebarOffset = $sidebar.offset();

            
            $clone.css({
                'top': (e.pageY - sidebarOffset.top - offsetNewsY) + 'px',
                'left': '0px'
            });

            
            let cloneTop = parseFloat($clone.css('top'));
            let cloneCenterY = sidebarOffset.top + cloneTop + $clone.outerHeight() / 2;
            
            
            $sidebar.find('.news-card:not(.dragging-clone), .dragging-placeholder').each(function() {
                let $current = $(this);
                
                if ($current.is($placeholder)) return true; 

                let currentOffset = $current.offset();
                let currentTop = currentOffset.top;
                let currentHeight = $current.outerHeight();
                let currentCenterY = currentTop + currentHeight / 2;

                
                if (cloneCenterY < currentCenterY) {
                    
                    if ($placeholder.index() > $current.index()) {
                        $current.before($placeholder);
                        return false;
                    }
                } 
                
                else { 

                    if ($placeholder.index() < $current.index()) {
                        $current.after($placeholder);
                        return false;
                    }
                }
            });
        }
    });

    $(document).on('mouseup', function() {
        if (!isDraggingSidebar) return;

        isDraggingSidebar = false;

        if ($placeholder && $draggedNewsItem) {
            let $clone = $sidebar.find('.dragging-clone');
        
            $placeholder.replaceWith($draggedNewsItem);
            $clone.remove();

            setTimeout(function() {
                if ($draggedNewsItem) {
                    $draggedNewsItem.removeData('is-dragging');
                }
            }, 50);
        } else {
            if ($draggedNewsItem) {
                $draggedNewsItem.removeData('is-dragging');
            }
        }

        // Reset biến
        $draggedNewsItem = null;
        $placeholder = null;
    });

    $('#sidebar').on('mouseup', '.news-header', function(e) {
        // Chỉ xử lý chuột trái
        if (e.button !== 0) return;

        const $newsCard = $(this).closest('.news-card');

        if ($newsCard.data('is-dragging')) {
            return;
        }

        const $newsContent = $newsCard.find('.news-content');
    
        if ($newsCard.hasClass('closed')) {
            $newsContent.removeClass('closed').addClass('open');
            $newsCard.removeClass('closed');
        } else {
            $newsContent.removeClass('open').addClass('closed');
            $newsCard.addClass('closed');
        }
    });


    function addNewImageFromThumb() {
        const defaultThumb = $('#thumbnail-palette .drag-item-thumb').first();
        if (defaultThumb.length === 0) {
            console.error("Lỗi: Không tìm thấy ảnh thumbnail mặc định để thêm.");
            return;
        }

        const imgSrc = defaultThumb.attr('src');
        const newImg = $('<img src="' + imgSrc + '" class="drag-item">');
        
        $('#image-area').append(newImg);

        newImg.css({
            position: 'relative',
        });

        enableDrag(newImg);
    }

    $('#btn-add-new').on('click', function(e) {
        e.preventDefault(); 
        addNewImageFromThumb();
    });

});
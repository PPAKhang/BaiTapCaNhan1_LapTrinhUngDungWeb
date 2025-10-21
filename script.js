$(document).ready(function() {
    // đồng bộ footer và nav
    const $menuItems = $('.menu-item');
    const $activeStatus = $('#active-status');

    function setActiveMenu(menuId, menuText) {
        $menuItems.removeClass('active');
        $menuItems.filter(`[data-menu-id="${menuId}"]`).addClass('active');
        if ($activeStatus.length) $activeStatus.text(`Đang xem: ${menuText}`);
    }

    $menuItems.on('click', function(e) {
        e.preventDefault();
        const $clickedItem = $(this);
        setActiveMenu($clickedItem.data('menu-id'), $clickedItem.text());
    });

    const initialActiveItem = $('.menu-item.active').first();
    if (initialActiveItem.length) {
        setActiveMenu(initialActiveItem.data('menu-id'), initialActiveItem.text());
    }

    // kéo thả thẻ news
    $('.news-content').each(function() {
        if (!$(this).hasClass('open')) {
            $(this).addClass('closed');
            $(this).closest('.news-card').addClass('closed');
        }
    });

    let isDraggingSidebar = false;
    let $draggedNewsItem = null;
    let $placeholder = null;
    let offsetNewsY;
    const $sidebar = $('#sidebar');

    $sidebar.on('mousedown', '.news-header', function(e) {
        if (e.button !== 0) return;
        startY = e.clientY;
        startX = e.clientX;
        $draggedNewsItem = $(this).closest('.news-card');
        let cardOffset = $draggedNewsItem.offset();
        offsetNewsY = e.pageY - cardOffset.top;
        e.preventDefault();
        $draggedNewsItem.data('isPreDragging', true);
    });

    $(document).on('mousemove', function(e) {
        if ($draggedNewsItem && $draggedNewsItem.data('isPreDragging')) {
            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);
            if (deltaX > dragThreshold || deltaY > dragThreshold) {
                if (!isDraggingSidebar) {
                    isDraggingSidebar = true;
                    $draggedNewsItem.data('isPreDragging', false);
                    $draggedNewsItem.data('is-dragging', true);
                    $placeholder = $('<div class="dragging-placeholder"></div>');
                    $placeholder.height($draggedNewsItem.outerHeight());
                    $draggedNewsItem.before($placeholder);
                    let $clone = $draggedNewsItem.clone(true, true);
                    $clone.addClass('dragging-clone');
                    $draggedNewsItem.after($clone);
                    $draggedNewsItem.css('visibility', 'hidden');
                    let sidebarOffset = $sidebar.offset();
                    $clone.css({
                        'top': (e.pageY - sidebarOffset.top - offsetNewsY) + 'px',
                        'left': '0px',
                        'width': $draggedNewsItem.outerWidth() + 'px'
                    });
                }
            } else return;
        }
    });

    // đóng mở sidebar
    $('#sidebar').on('mouseup', '.news-header', function(e) {
        if (e.button !== 0) return;
        const $newsCard = $(this).closest('.news-card');
        if ($newsCard.data('is-dragging')) return;
        if ($newsCard.data('isPreDragging')) $newsCard.removeData('isPreDragging');
        const $newsContent = $newsCard.find('.news-content');
        if ($newsCard.hasClass('closed')) {
            $newsContent.removeClass('closed').addClass('open');
            $newsCard.removeClass('closed');
        } else {
            $newsContent.removeClass('open').addClass('closed');
            $newsCard.addClass('closed');
        }
    });

    // dropdwon list
    $('#dropdown-display').on('click', function(e) {
        e.stopPropagation();
        $('#thumbnail-palette').toggleClass('hidden');
        $(this).toggleClass('active');
    });
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown-wrapper').length) {
            $('#thumbnail-palette').addClass('hidden');
            $('#dropdown-display').removeClass('active');
        }
    });

    // tính năng add new
    let nextImageX = 10;
    let nextImageY = 10;
    const IMAGE_SIZE = 100;
    const PADDING = 20;
    let CONTAINER_WIDTH = 0;
    setTimeout(() => {
        CONTAINER_WIDTH = $('#image-area').width();
    }, 0); 

    function addNewImageToCanvas(imgSrc, x, y) {
        const newImg = $('<img src="' + imgSrc + '" class="drag-item">');
        newImg.css({
            position: 'absolute',
            left: x + 'px',
            top: y + 'px',
            width: IMAGE_SIZE + 'px',
            height: IMAGE_SIZE + 'px',
            cursor: 'grab',
            zIndex: 1
        });
        $('#image-area').append(newImg);
        enableDrag(newImg);
    }

    function calculateNextPosition() {
        if (CONTAINER_WIDTH === 0) CONTAINER_WIDTH = $('#image-area').width();
        if (nextImageX + IMAGE_SIZE + PADDING > CONTAINER_WIDTH) {
            nextImageX = 10;
            nextImageY += IMAGE_SIZE + PADDING;
        }
        const position = { x: nextImageX, y: nextImageY };
        nextImageX += IMAGE_SIZE + PADDING;
        return position;
    }

    function addNewImageFromThumb() {
        const defaultThumb = $('#thumbnail-palette .drag-item-thumb').first();
        if (defaultThumb.length === 0) {
            console.error("Không tìm thấy ảnh.");
            return;
        }
        const imgSrc = defaultThumb.attr('src');
        const pos = calculateNextPosition();
        addNewImageToCanvas(imgSrc, pos.x, pos.y);
    }

    $('#btn-add-new').off('click').on('click', function(e) {
        e.preventDefault();
        addNewImageFromThumb();
    });

    // kéo thả ảnh drag&drop 
    let isDraggingThumb = false;
    let $draggedThumb = null;
    let thumbOffsetX, thumbOffsetY;
    let startY, startX;
    const dragThreshold = 5;

    $('#thumbnail-palette').on('mousedown', '.drag-item-thumb', function(e) {
        if (e.button !== 0) return;
        startX = e.clientX; 
        startY = e.clientY; 
        const $thumb = $(this);
        const imgSrc = $thumb.attr('src');
        thumbOffsetX = e.offsetX;
        thumbOffsetY = e.offsetY;
        $thumb.data('imgSrc', imgSrc);
        e.preventDefault();
        $thumb.data('isPreDragging', true);
        $thumb.data('draggedThumbClone', null);
    });

    $(document).on('mousemove', function(e) {
        const $preDraggingThumb = $('#thumbnail-palette').find('.drag-item-thumb').filter(function() {
            return $(this).data('isPreDragging');
        });

        if ($preDraggingThumb.length) {
            if (!isDraggingThumb) {
                const deltaX = Math.abs(e.clientX - startX);
                const deltaY = Math.abs(e.clientY - startY);
                if (deltaX > dragThreshold || deltaY > dragThreshold) {
                    isDraggingThumb = true;
                    $('#thumbnail-palette').addClass('hidden');
                    $('#dropdown-display').removeClass('active');
                    const imgSrc = $preDraggingThumb.data('imgSrc');
                    $draggedThumb = $('<img src="' + imgSrc + '" class="dragging-thumb-clone">');
                    $('body').append($draggedThumb);
                    $preDraggingThumb.data('draggedThumbClone', $draggedThumb);
                    $draggedThumb.css({
                        position: 'fixed',
                        left: (e.pageX - thumbOffsetX) + 'px',
                        top: (e.pageY - thumbOffsetY) + 'px',
                        width: '50px',
                        height: '50px',
                        zIndex: 10000,
                        opacity: 0.8,
                        cursor: 'grabbing',
                        pointerEvents: 'none',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px'
                    });
                } else return;
            }
            if (isDraggingThumb && $draggedThumb) {
                $draggedThumb.css({
                    left: (e.pageX - thumbOffsetX) + 'px',
                    top: (e.pageY - thumbOffsetY) + 'px'
                });
            }
        }

        // kéo thẻ sidebar
        if (isDraggingSidebar && $placeholder) {
            let $clone = $sidebar.find('.dragging-clone');
            let sidebarOffset = $sidebar.offset();
            $clone.css({
                'top': (e.pageY - sidebarOffset.top - offsetNewsY) + 'px',
                'left': '0px'
            });
            let cloneTop = parseFloat($clone.css('top'));
            let cloneCenterY = sidebarOffset.top + cloneTop + $clone.outerHeight() / 2;
            $sidebar.find('.news-card:not(.dragging-clone, .dragging-placeholder)').each(function() {
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
                } else {
                    if ($placeholder.index() < $current.index()) {
                        $current.after($placeholder);
                        return false;
                    }
                }
            });
        }
    });

    // kéo thả ảnh drag&drop
    function enableDrag($img) {
        let offsetX, offsetY;
        $img.off('mousedown.itemdrag').on('mousedown.itemdrag', function(e) {
            if (e.button !== 0) return;
            const imgOffset = $(this).offset();
            offsetX = e.pageX - imgOffset.left;
            offsetY = e.pageY - imgOffset.top;
            $(this).data('isDragging', true);
            $(this).data('offsetX', offsetX);
            $(this).data('offsetY', offsetY);
            $(this).css({
                position: 'absolute',
                zIndex: 9999,
                cursor: 'grabbing'
            }).addClass('dragging');
            e.preventDefault();
        });
    }

    $(document).on('mousemove', function(e) {
        const $draggingItem = $('.drag-item.dragging');
        if ($draggingItem.length) {
            const containerOffset = $('#image-area').offset();
            const isDragging = $draggingItem.data('isDragging');
            const itemOffsetX = $draggingItem.data('offsetX');
            const itemOffsetY = $draggingItem.data('offsetY');
            if (isDragging) {
                const x = e.pageX - containerOffset.left - itemOffsetX;
                const y = e.pageY - containerOffset.top - itemOffsetY;
                $draggingItem.css({ left: x + 'px', top: y + 'px' });
            }
        }
    });

    // xử lý mouseup 
    $(document).on('mouseup', function(e) {
        const $draggingItem = $('.drag-item.dragging');
        if ($draggingItem.length) {
            $draggingItem.data('isDragging', false);
            $draggingItem.css({ zIndex: 1, cursor: 'grab' }).removeClass('dragging');
        }

        const $preDraggingThumb = $('#thumbnail-palette').find('.drag-item-thumb').filter(function() {
            return $(this).data('isPreDragging');
        });

        if ($preDraggingThumb.length && !isDraggingThumb) {
            const imgSrc = $preDraggingThumb.data('imgSrc');
            if (imgSrc) {
                const pos = calculateNextPosition();
                addNewImageToCanvas(imgSrc, pos.x, pos.y);
            }
            $('#thumbnail-palette').addClass('hidden');
            $('#dropdown-display').removeClass('active');
            $preDraggingThumb.data('isPreDragging', false);
        }

        if (isDraggingThumb && $draggedThumb) {
            const $imageArea = $('#image-area');
            const areaOffset = $imageArea.offset();
            const areaWidth = $imageArea.outerWidth();
            const areaHeight = $imageArea.outerHeight();
            const mouseX = e.pageX;
            const mouseY = e.pageY;

            if (mouseX >= areaOffset.left && mouseX <= areaOffset.left + areaWidth &&
                mouseY >= areaOffset.top && mouseY <= areaOffset.top + areaHeight) {
                const imgSrc = $draggedThumb.attr('src');
                const relativeX = mouseX - areaOffset.left - thumbOffsetX;
                const relativeY = mouseY - areaOffset.top - thumbOffsetY;
                addNewImageToCanvas(imgSrc, relativeX, relativeY);
                nextImageX = 10;
                nextImageY = 10;
            }

            $draggedThumb.remove();
            $draggedThumb = null;
            isDraggingThumb = false;
            $preDraggingThumb.data('isPreDragging', false);
        }

        if (isDraggingSidebar) {
            isDraggingSidebar = false;
            if ($draggedNewsItem) $draggedNewsItem.css('visibility', 'visible');
            if ($placeholder && $draggedNewsItem) {
                let $clone = $sidebar.find('.dragging-clone');
                $placeholder.replaceWith($draggedNewsItem);
                $clone.remove();
            }
            if ($draggedNewsItem) {
                $draggedNewsItem.removeData('is-dragging');
                $draggedNewsItem.removeData('isPreDragging');
            }
            $draggedNewsItem = null;
            $placeholder = null;
        }

        $('#sidebar').find('.news-card').removeData('isPreDragging');
        $('#thumbnail-palette').find('.drag-item-thumb').removeData('isPreDragging');
    });

    

    //khởi tạo kéo ảnh đã có
    $('.drag-item').each(function() {
        enableDrag($(this));
    });

});

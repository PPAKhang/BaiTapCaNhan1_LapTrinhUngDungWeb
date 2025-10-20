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
            // Chỉ bắt sự kiện chuột trái
            if (e.button !== 0) return; 

            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            
            // Sử dụng position: absolute và z-index để cho phép kéo
            $(this).css({
                position: 'absolute',
                zIndex: 9999,
                cursor: 'grabbing'
            }).addClass('dragging');
            
            // Ngăn chặn việc chọn văn bản trong quá trình kéo
            e.preventDefault(); 
        });

        // Xử lý kéo
        $(document).on('mousemove', function(e) {
            if (isDragging) {
                const containerOffset = $('#image-area').offset();
                
                // Tính toán vị trí mới cho phần tử kéo
                const x = e.pageX - containerOffset.left - offsetX;
                const y = e.pageY - containerOffset.top - offsetY;

                $('.dragging').css({
                    left: x + 'px',
                    top: y + 'px'
                });
            }
        });

        // Xử lý thả
        $(document).on('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                
                // Loại bỏ các style kéo và class
                $('.dragging').css({
                    zIndex: 1, // Trả về z-index ban đầu nếu cần
                    cursor: 'grab' // Trả về con trỏ grab nếu cần
                    // Giữ lại position: absolute và left/top để giữ vị trí
                }).removeClass('dragging');
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

    // =========================================================================
    // ĐÓNG MỞ NEWS CỦA SIDE BAR VÀ XỬ LÝ XUNG ĐỘT KÉO THẢ
    // =========================================================================

    // 1. Thiết lập trạng thái ban đầu
    $('.news-content').each(function() {
        if (!$(this).hasClass('open')) {
            $(this).addClass('closed');
            $(this).closest('.news-card').addClass('closed');
        }
    });

    // 2. Kéo thả cho news của sidebar thay đổi vị trí
    let isDraggingSidebar = false;
    let $draggedNewsItem = null;
    let offsetNewsY;
    let initialLeft;
    let $sidebar = $('#sidebar');
    let $placeholder = null; 

    $sidebar.on('mousedown', '.news-card', function(e) {
        // Chỉ xử lý chuột trái và khi click vào news-header
        if (e.button !== 0 || $(e.target).closest('.news-header').length === 0) return;
    
        isDraggingSidebar = true;
        $draggedNewsItem = $(this);
    
        let itemOffset = $draggedNewsItem.offset();
        offsetNewsY = e.clientY - itemOffset.top;
        initialLeft = itemOffset.left;

        // Tạo placeholder
        $placeholder = $('<div></div>').addClass('dragging-placeholder').css({
            'height': $draggedNewsItem.outerHeight() + 'px',
            'marginBottom': $draggedNewsItem.css('marginBottom'),
            'marginTop': $draggedNewsItem.css('marginTop'),
            'border': '1px dashed #aaa',
            'backgroundColor': '#f9f9f9',
            'borderRadius': '4px'
        });
    
        // Tạo clone để kéo
        let $clone = $draggedNewsItem.clone().addClass('dragging-clone');
        
        // Thay thế $draggedNewsItem bằng placeholder và xóa phần tử gốc khỏi DOM
        $draggedNewsItem.after($placeholder);
        $draggedNewsItem.detach(); 
        
        // Chèn clone vào DOM để kéo
        $sidebar.append($clone);

        $clone.css({
            position: 'absolute',
            zIndex: 1000,
            width: $placeholder.outerWidth() + 'px', 
            cursor: 'grabbing',
            top: e.clientY - offsetNewsY + 'px',
            left: initialLeft + 'px', 
            opacity: 0.8,
            // Đảm bảo clone không bị ảnh hưởng bởi CSS kéo/thả thường
            'box-shadow': '0 4px 10px rgba(0, 0, 0, 0.2)' 
        });

        e.preventDefault(); 
        e.stopPropagation(); 
    });

    $(document).on('mousemove', function(e) {
        if (!isDraggingSidebar || !$draggedNewsItem || !$placeholder) return;

        let $clone = $sidebar.find('.dragging-clone');

        // Di chuyển clone theo chuột
        $clone.css({
            'top': e.clientY - offsetNewsY + 'px',
            'left': initialLeft + 'px'
        });

        // Tính toán tâm của clone
        let cloneCenterY = e.clientY - offsetNewsY + $clone.outerHeight() / 2;
        
        // Lặp qua tất cả các thẻ news (trừ clone) và placeholder
        $sidebar.find('.news-card:not(.dragging-clone), .dragging-placeholder').each(function() {
            let $current = $(this);
            // Bỏ qua nếu là chính placeholder
            if ($current.is($placeholder)) return true; 

            let currentOffset = $current.offset();
            let currentTop = currentOffset.top;
            let currentHeight = $current.outerHeight();
            let currentCenterY = currentTop + currentHeight / 2;

            // Nếu clone kéo lên phía trên $current
            if (cloneCenterY < currentCenterY) {
                // Chỉ chèn nếu placeholder đang ở vị trí sau $current
                if ($placeholder.index() > $current.index()) {
                    $current.before($placeholder);
                    return false; // Dừng vòng lặp sau khi chèn
                }
            } 
            // Nếu clone kéo xuống phía dưới $current
            else { 
                // Chỉ chèn nếu placeholder đang ở vị trí trước $current
                if ($placeholder.index() < $current.index()) {
                    $current.after($placeholder);
                    return false; // Dừng vòng lặp sau khi chèn
                }
            }
        });
    });

    $(document).on('mouseup', function() {
        if (!isDraggingSidebar || !$draggedNewsItem || !$placeholder) return;

        // Gán data để báo hiệu rằng phần tử này vừa được di chuyển
        $draggedNewsItem.data('just-moved', true); 

        isDraggingSidebar = false;
    
        let $clone = $sidebar.find('.dragging-clone');
    
        // Chèn phần tử gốc ($draggedNewsItem) vào vị trí của placeholder
        $placeholder.replaceWith($draggedNewsItem);
        $clone.remove(); // Xóa clone

        // Reset biến
        $draggedNewsItem = null;
        $placeholder = null;
    });

    // 3. Xử lý sự kiện đóng/mở (Sử dụng delegation)
    $('#sidebar').on('click', '.news-header', function(e) {

        const $newsCard = $(this).closest('.news-card');

        // KIỂM TRA: Nếu thẻ news vừa được di chuyển, ngăn chặn sự kiện click lần này
        if ($newsCard.data('just-moved')) {
            $newsCard.removeData('just-moved'); // Reset trạng thái
            e.stopImmediatePropagation(); // Ngăn chặn sự kiện này ngay lập tức
            return;
        }

        // LOGIC ĐÓNG/MỞ
        const $newsContent = $newsCard.find('.news-content');
    
        if ($newsCard.hasClass('closed')) {
            $newsContent.removeClass('closed').addClass('open');
            $newsCard.removeClass('closed');
        } else {
            $newsContent.removeClass('open').addClass('closed');
            $newsCard.addClass('closed');
        }
    });

});
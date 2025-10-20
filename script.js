$(document).ready(function() {
    
    //tính năng của dropdown
    $('#dropdown-display').on('click', function(e) {
        e.stopPropagation();
        $('#thumbnail-palette').toggleClass('hidden');
    });

    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown-wrapper').length) {
            $('#thumbnail-palette').addClass('hidden');
        }
    });

    $('.drag-item-thumb').on('click', function() {
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

        $('#image-area').on('mousemove', function(e) {
            if (isDragging) {
                const containerOffset = $(this).offset();
                const x = e.pageX - containerOffset.left - offsetX;
                const y = e.pageY - containerOffset.top - offsetY;

                $('.dragging').css({
                    left: x + 'px',
                    top: y + 'px'
                });
            }
        });
    }
});

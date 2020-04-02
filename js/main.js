(function($, window, document) {
	var cloudinary_config = {
			cloudName: 'asphalte', 
			uploadPreset: 'shopify_widget',
			sources: [ 'local' ],
		},
		cloudinary_widget = cloudinary.createUploadWidget(
			cloudinary_config,
			(error, result) => callback_upload(error, result)
		),
		cloudinary_split = "upload/",
		cloudinary_desktop_width = 2000,
		cloudinary_desktop_height = 1400,
		cloudinary_desktop_transformation = `c_scale,h_${cloudinary_desktop_height}/c_crop,h_${cloudinary_desktop_height},w_${cloudinary_desktop_width}`,
		cloudinary_desktop_x = ',x_0/';
		cloudinary_mobile_width = 768,
		cloudinary_mobile_height = 768,
		cloudinary_mobile_transformation = `c_scale,h_${cloudinary_mobile_height}/c_crop,h_${cloudinary_mobile_height},w_${cloudinary_mobile_width}`,
		cloudinary_mobile_x = ',x_0/';

	var carrousel = {},
		images = [],
		App = $('#app'),
		item_to_crop = 'image_croper',
		item_to_crop_class = 'image_big',
		item_draggable = 'ui-state-default',
		list_images = 'list_images',
		list_crop = 'list_croping',
		input_slider = 'image_slider',
		input_form = 'input_variante';

	 /*var json = {
		"blanc": [
		  {
			"id": "0",
			"queue": "0",
			"type": "image",
			"link_desktop": "https://res.cloudinary.com/asphalte/image/upload/v1585153298/product/DSB02562.jpg"
		  },
		  {
			"id": "1",
			"queue": "1",
			"type": "image",
			"link_desktop": "https://res.cloudinary.com/asphalte/image/upload/v1585153629/product/DSB01813.jpg"
		  },
		  {
			"id": "2",
			"queue": "2",
			"type": "image",
			"link_desktop": "https://res.cloudinary.com/asphalte/image/upload/v1585153631/product/DSB01841.jpg"
		  }
		]
	};*/

	$(function() {
		watch_form();
		$(".json").click(function() {
			$("<a />", {
			  "download": "data.json",
			  "href" : "data:application/json," + encodeURIComponent(JSON.stringify(carrousel))
			}).appendTo("body")
			.click(function() {
			   $(this).remove()
			})[0].click()
		  })
		/*
		watch_upload();
		
		  */
	});

	function lunch_upload() {
		cloudinary_widget.open();
	}

	function watch_form() {
		$('.form').on('submit', (e) => {
			let name = $(`#${input_form}`);
			
			create_variante(name.val());
			lunch_upload();
			
			name.val('');
			return false;
		  });
		
	}

	function watch_crop() {
		$(`.${item_to_crop}`).on('click', (event) => {
			let src_desktop = create_image("desktop", event.target.src, cloudinary_desktop_x),
				bloc_desktop = $(`<div class="desktop"></div>`),
				image_desktop  = $(`<img src="${src_desktop}" class="${item_to_crop_class} ${item_draggable}" />`);
			
			let src_mobile = create_image("mobile", event.target.src, cloudinary_desktop_x),
				bloc_mobile = $(`<div class="desktop"></div>`),
				image_mobile  = $(`<img src="${src_mobile}" class="${item_to_crop_class} ${item_draggable}" />`);
			
			let slider_desktop = document.createElement('input');
				slider.setAttribute('type', 'range');
				slider.setAttribute('min', 0);
				slider.setAttribute('max', 100);
				slider.setAttribute('value', 0);
				slider.setAttribute('class', input_slider);
				
				$(`.tool`).append(bloc_desktop);
				$(`.desktop`).append(image_desktop);
				$(`.desktop`).append(slider_desktop);
				$(`.tool`).append(bloc_mobile);
				$(`.mobile`).append(image_mobile);
				$(`.mobile`).append(slider_mobile);
				watch_slider();
			return false;
		});
	}

	function watch_slider() {
		$(`.${input_slider}`).on('change', (event) => {
			let image = $(`.${item_to_crop_class}`);
			let source = image.attr('src');
			image.attr('src', slide_image(source, event.target.value));
			return false;
		})
	}

	function create_variante(name) {
		carrousel[name] = {};
		let nav = $('.navigation');
		let variante = $(`<div class="variante ${name}"></div>`);
		let tool = $(`<div class="tool ${name}"></div>`);
		let item = $(`<li class="title">${name}<li/>`);
		let list = $(`<ul class="${list_images}"><ul/>`);
		
		
		nav.append(item);
		variante.append(list);
		App.append(variante);
		App.append(tool);
		$(`.${list_images}`).sortable();
	}


	function callback_upload(error, result) {
		if (!error && result ) {
			switch(result.event) {
				case 'success':
					console.log(result);
					images.push({
						"type" : result.info.resource_type,
						"link_desktop" : result.info.secure_url
					});
					carrousel.blanc = images;
					console.log(carrousel);
					break;
				case 'queues-end':
					cloudinary_widget.close();
					display_images(images);
					break;
				default :
					break;
			}
		}
	}

	function display_images (images) {
		$.each(images, ( index, value ) => {
			let result;
			if (value.type === "image") {
				result = $(`<img src="${value.link_desktop}" class="${item_to_crop}" />`);
			} else {
				result = $(`<video src="${value.link_desktop}" class="${item_to_crop}" />`);
			}
			let link = $(`<li class="link_croper"></li>`);

			link.append(result);
			$(`.${list_images}`).append(link);
			$('.json').show();
		});
		watch_crop();
	}

	function create_image (size, url, initial_gravity) {
		let image_resize = url.split(cloudinary_split);
		if (size === "desktop") {
			return (
				image_resize[0]
				+ cloudinary_split
				+ cloudinary_desktop_transformation
				+ initial_gravity
				+ image_resize[1]
			);
		} else {
			return (
				image_resize[0]
				+ cloudinary_split
				+ cloudinary_mobile_transformation
				+ initial_gravity
				+ image_resize[1]
			);
		}
	}

	function slide_image (url, new_gravity) {
		let image_slide = url.split(cloudinary_desktop_x);

		return (
			image_slide[0]
			+ `,x_${new_gravity}/`
			+ image_slide[1]
		)
	}

}(window.jQuery, window, document));
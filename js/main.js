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
		title = [],
		section = 0,
		index = 0,
		App = $('#app'),
		item_to_crop = 'image_croper',
		item_to_crop_class = 'image_big',
		item_draggable = 'ui-state-default',
		list_images = 'list_images',
		list_crop = 'list_croping',
		input_slider = 'image_slider',
		input_form = 'input_variante';

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
	});

	function lunch_upload() {
		image = [];
		cloudinary_widget.open();
	}

	function watch_form() {
		$('.form').on('submit', (e) => {
			lunch_upload();
			return false;
		  });
		
	}

	function watch_crop() {
		$(`.${item_to_crop}`).on('click', (event) => {
			let src_desktop = create_image("desktop", event.target.src, cloudinary_desktop_x),
				bloc_desktop = $(`<div class="desktop"></div>`),
				image_desktop  = $(`<img src="${src_desktop}" class="${item_to_crop_class} ${item_draggable}" />`);
			
			let src_mobile = create_image("mobile", event.target.src, cloudinary_desktop_x),
				bloc_mobile = $(`<div class="mobile"></div>`),
				image_mobile  = $(`<img src="${src_mobile}" class="${item_to_crop_class} ${item_draggable}" />`);
			
			let slider_desktop = document.createElement('input');
				slider_desktop.setAttribute('type', 'range');
				slider_desktop.setAttribute('min', 0);
				slider_desktop.setAttribute('max', 100);
				slider_desktop.setAttribute('value', 0);
				slider_desktop.setAttribute('class', `${input_slider} desktop`);

			let slider_mobile = document.createElement('input');
				slider_mobile.setAttribute('type', 'range');
				slider_mobile.setAttribute('min', 0);
				slider_mobile.setAttribute('max', 200);
				slider_mobile.setAttribute('value', 0);
				slider_mobile.setAttribute('class', `${input_slider} mobile`);
			
			let name = $(`#${input_form}`);
			let bloc = $(`#${name.val()}`);
			let tool = $(`<div class="tool ${name.val()}"></div>`);
			bloc.append(tool);
				
				$(`.tool`).append(bloc_desktop);
				$(`.desktop`).append(image_desktop);
				$(`.desktop`).append(slider_desktop);
				$(`.tool`).append(bloc_mobile);
				$(`.mobile`).append(image_mobile);
				$(`.mobile`).append(slider_mobile);
				watch_slider("desktop");
				watch_slider("mobile");
			return false;
		});
	}

	function watch_slider(size) {
		$(`.${input_slider}.${size}`).on('change', (event) => {
			console.log(event);
			let image = $(`.${size} > .${item_to_crop_class}`);
			let source = image.attr('src');
			image.attr('src', slide_image(source, event.target.value));
			return false;
		})
	}

	function create_variante(section, name) {


		//list.append(item);
		
		/*
		let variante = $(`<div id="${name}" class="variante"></div>`);
		let tool = $(`<div class="tool ${name}"></div>`);
		let item = $(`<li class="title" href="#${name}">${name}<li/>`);
		let list = $(`<ul class="${list_images}"><ul/>`);
		
		
		list.append(item);
		variante.append(tool);
		App.prepend(list);
		App.append(variante);
		
		App.tabs();
		*/
	}


	function callback_upload(error, result) {
		let name = $(`#${input_form}`);
		if (!error && result ) {
			switch(result.event) {
				case 'success':
					callback_success(name, result);
					break;
				case 'queues-end':
					var input = $(`#input_variante`);
					var variante = $(`<div id="${input.val()}" class="variante"></div>`);
					var nav = $('<ul id="nav" class="navigation"></ul>');
					var list = $(`<ul class="${list_images}"><ul/>`);
					var item = $(`<li class="title ${section}"><a href="#${input.val()}">${input.val()}</a><li/>`);
					App.append(variante);
					variante.append(list);
					list.sortable();

					callback_end(section);
					console.log(carrousel);
					if(section === 0) {
						App.prepend(nav);
						section = section + 1;
					}
					$('#nav').append(item);
					var new_app = $('#app');
					$('#app').remove();
					$('.form').append(new_app);
					new_app.tabs();
					
					watch_crop();
					break;
				default :
					break;
			}
		}
	}

	function callback_success(name, result) {
		images.push({
			"id" : index,
			"type" : result.info.resource_type,
			"link_desktop" : create_image("desktop", result.info.secure_url, cloudinary_desktop_x),
			"link_mobile": create_image("mobile", result.info.secure_url, cloudinary_mobile_x)
		});
		index = index + 1;
		carrousel[name.val()] = images;
		console.log(carrousel);
	}

	function callback_end(section, name) {
		return new Promise((resolve, reject) => {
			cloudinary_widget.close();
			var input = $(`#input_variante`);
			carrousel[input.val()] = {};
			title.push(input.val());
			display_images();
			images = [];
			index = 0;
			resolve(section + 1);
		});
	}

	function display_images () {
		$.each(images, ( index, value ) => {
			let result;
			if (value.type === "image") {
				result = $(`<img src="${value.link_desktop}" class="${item_to_crop}" />`);
			} else {
				result = $(`<video src="${value.link_desktop}" class="${item_to_crop}" />`);
			}
			let link = $(`<li class="link_croper"></li>`);
			carrousel[$(`#input_variante`).val()] = images;
			link.append(result);
			$(`.${list_images}`).append(link);
			$('.json').show();
		});
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
		let image_slide = url.split(`x_`);
		console.log(image_slide[0]);
		console.log(image_slide[1]);
		return (
			image_slide[0]
			+ `,x_${new_gravity}/`
			+ image_slide[1]
		)
	}

}(window.jQuery, window, document));
(function($, window, document) {
	var cloudinary_config = {
			cloudName: `asphalte`, 
			uploadPreset: `shopify_widget`,
			sources: [ `local` ],
		},
		cloudinary_widget = cloudinary.createUploadWidget(
			cloudinary_config,
			(error, result) => callback_upload(error, result)
		),
		cloudinary_split = `upload/`,
		cloudinary_desktop = `https://res.cloudinary.com/asphalte/image/upload/c_scale,h_1400/c_crop,h_1400,w_2000`,
		cloudinary_mobile = `https://res.cloudinary.com/asphalte/image/upload/c_scale,h_768/c_crop,h_768,w_768`,
		cloudinary_desktop_width = 2000,
		cloudinary_desktop_height = 1400,
		cloudinary_desktop_transformation = `c_scale,h_${cloudinary_desktop_height}/c_crop,h_${cloudinary_desktop_height},w_${cloudinary_desktop_width}`,
		cloudinary_desktop_x = ',x_0/';
		cloudinary_mobile_width = 768,
		cloudinary_mobile_height = 768,
		cloudinary_mobile_transformation = `c_scale,h_${cloudinary_mobile_height}/c_crop,h_${cloudinary_mobile_height},w_${cloudinary_mobile_width}`,
		cloudinary_mobile_x = ',x_0/';

	var global = {
		carrousel: {},
		title: [],
		section: 0,
		index: 0,
		name: ''
	}

	var selector = {
		app: $('#app'),
		json: 'json',
		form: 'form',
		input_form: 'input_variante',
		item_to_crop: 'image_croper',
		item_to_crop_class: 'image_big',
		item_draggable: 'ui-state-default',
		list_images: 'list_images',
		list_crop: 'list_croping',
		input_slider: 'image_slider'
	}

	$(function() {
		watch_form();
	});

	function download_button() {
		$(`.${selector.json}`).show();
		$(`.${selector.json}`).click(function() {
			$("<a />", {
			  "download": "data.json",
			  "href" : "data:application/json," + encodeURIComponent(JSON.stringify(global.carrousel))
			}).appendTo("body")
			.click(function() {
			   $(this).remove()
			})[0].click()
		})
	}

	function watch_form() {
		$(`.${selector.form}`).on('submit', (e) => {
			set_name().then(() => {
				cloudinary_widget.open();
			});
			return false;
		});
	}

	function set_name() {
		let name_variante = $(`#${selector.input_form}`);

		return new Promise((resolve, reject) => {
			if (name_variante.val() !== '') {
				global.name = name_variante.val();
				global.carrousel[global.name] = [];
				name_variante.val('');
				resolve();
			} else {
				reject();
			}
		});
	}

	function watch_switch(tab) {
		console.log(tab);
		$(`a[href='#${tab}']`).on('click', function(event) {
			global.name = tab;
		});
	}

	function watch_crop() {
		$('.image_croper').on('click', function(event) {
			console.log(global.name);
			$(`.tool`).hide();
			$(`#${global.name}`).find(`.tool.${global.name}-${event.target.id}`).show();
			display_resizer(event.target.id);
		});
	}

	function watch_edit() {
		$('input[type=range]').on('change', function (event) {
			let id = $(this).attr('id');

			if ($(this).attr('class') === `image_slider-desktop`) {
				let bloc = $(`.tools`).find(`.${global.name}-${id}-desktop`);
				let src = slide_image(`desktop`, global.carrousel[global.name][id].link_desktop, event.target.value);
				bloc.find('.image_big').remove();
				bloc.find('.description').after($(`<img src="${src}" class="${selector.item_to_crop_class} ${selector.item_draggable}" />`));
				global.carrousel[global.name][id].link_desktop = src;
			} else {
				let bloc = $(`.tools`).find(`.${global.name}-${id}-mobile`);
				let src = slide_image(`mobile`, global.carrousel[global.name][id].link_mobile, event.target.value);
				bloc.find('.image_big').remove();
				bloc.find('.description').after($(`<img src="${src}" class="${selector.item_to_crop_class} ${selector.item_draggable}" />`));
				global.carrousel[global.name][id].link_mobile = src;
			}
		});
	}

	function display_resizer (id) {
		if ($(`${global.name}-${id}-desktop`) !== undefined) {

			let src_desktop = global.carrousel[global.name][id].link_desktop,
				bloc_desktop = $(`<div class="${global.name}-${id}-desktop"></div>`),
				title_desktop = $(`<p class="description">Affichage Desktop :<br />Format (2000x1300) Webp </p>`),
				image_desktop  = $(`<img src="${src_desktop}" class="${selector.item_to_crop_class} ${selector.item_draggable}" />`),
				slider_desktop = $(`<input type="range" min=0 max=100 value=0 step="10" id="${id}" class="${selector.input_slider}-desktop" />`);
			
			let src_mobile = global.carrousel[global.name][id].link_mobile,
				bloc_mobile = $(`<div class="${global.name}-${id}-mobile"></div>`),
				title_mobile = $(`<p class="description">Affichage Mobile :<br />Format (768x768) Webp </p>`),
				image_mobile  = $(`<img src="${src_mobile}" class="${selector.item_to_crop_class} ${selector.item_draggable}" />`),
				slider_mobile = $(`<input type="range" min=0 max380 value=0 step="10" id="${id}" class="${selector.input_slider}-mobile" />`);

			bloc_desktop.append(title_desktop);
			bloc_desktop.append(image_desktop);
			bloc_desktop.append(slider_desktop);

			bloc_mobile.append(title_mobile);
			bloc_mobile.append(image_mobile);
			bloc_mobile.append(slider_mobile);

			let already = $(`#${global.name}`).find(`.tool.${global.name}-${id} .${global.name}-${id}-desktop`);
			if (already.length === 0) {
				$(`#${global.name}`)
					.find(`.tool.${global.name}-${id}`)
					.append(bloc_desktop)
					.append(bloc_mobile);
			}
			watch_edit();
		}
	}

	function callback_upload(error, result) {
		if (!error && result ) {
			switch(result.event) {
				case 'success':
					upload_success(result);
					break;
				case 'queues-end':
					upload_end(result);
					break;
				default :
					break;
			}
		}
	}

	function upload_success(result) {
		global.carrousel[global.name].push({
			"id" : global.index,
			"type" : result.info.resource_type,
			"link_desktop" : create_image("desktop", result.info.secure_url, cloudinary_desktop_x),
			"link_mobile": create_image("mobile", result.info.secure_url, cloudinary_mobile_x)
		});
		global.index = global.index + 1;
	}

	function upload_end() {
		let variante = $(`<div id="${global.name}" class="variante"></div>`);
		selector.app.append(variante);

		create_variante_bar().then(() => {
			create_tool_blocs().then(() => {
				display_images().then(() => {
					let tabs = selector.app.tabs();
					tabs.tabs( "refresh" );
					$(`#${global.name}`).find(`.${selector.list_images}`).sortable();
					download_button();
					watch_crop();
					watch_switch(global.name);
					global.index = 0;
					cloudinary_widget.close();
				});
			});
		});
	}

	function create_variante_bar () {
		return new Promise((resolve) => {
			var nav = $('<ul id="nav" class="navigation"></ul>');
			var item = $(`<li class="title ${global.section}"><a href="#${global.name}">${global.name}</a><li/>`);
	
			if(global.section === 0) {
				nav.prepend(item);
				selector.app.prepend(nav);
				selector.app.prepend($('<p class="subtitle">Gestion des variables :</p>'));
				
			} else {
				$(`#nav`).prepend(item);
			}
			global.section = global.section + 1;
			resolve();
		});
	}

	function create_tool_blocs () {
		let variante = $(`#${global.name}`);
		let tools = $(`<div class="tools"></div>`);

		return new Promise((resolve,reject) => {
			if (global.carrousel[global.name]) {
				for (let i = 0; i < global.index; i++) {
					let tool = $(`<div class="tool ${global.name}-${i}"></div>`);
					tools.append(tool);
				}
				variante.append(tools);
				$('.tool').each(function(index) {
					$(this).hide();
				});
				resolve();
			} else {
				reject();
			}
		});
	}

	function display_images () {
		let variante = $(`#${global.name}`);
		var list = $(`<ul class="${selector.list_images}"><ul/>`);

		return new Promise((resolve,reject) => {
			if (global.carrousel[global.name]) {
				$.each(global.carrousel[global.name], ( index, value ) => {
					let result;
					let link = $(`<li class="link_croper"></li>`);
				
					if (value.type === 'image') {
						result = $(`<span class="position">${index + 1}</span><img src="${value.link_desktop}" id="${index}" class="${selector.item_to_crop}" />`);
					} else {
						result = $(`<span class="position">${index + 1 }</span><video src="${value.link_desktop}" id="${index}" class="${selector.item_to_crop}" />`);
					}
					
					link.append(result);
					$(list).append(link);
				});
				variante.prepend(list);
				resolve();
			} else {
				reject();
			}
		});
	}

	function create_image (format, url, gravity) {
		let image_resize = url.split(cloudinary_split);
		
		if (format === 'desktop') {
			return (
				image_resize[0]
				+ cloudinary_split
				+ cloudinary_desktop_transformation
				+ gravity
				+ image_resize[1]
			);
		} else {
			return (
				image_resize[0]
				+ cloudinary_split
				+ cloudinary_mobile_transformation
				+ gravity
				+ image_resize[1]
			);
		}
	}

	function slide_image (format, url, new_gravity) {
		let image_slide = url.split(`/`);

		if (format === `desktop`) {
			return (
				cloudinary_desktop
				+ `,x_${new_gravity}/`
				+ `${image_slide[8]}/`
				+ `${image_slide[9]}/`
				+ image_slide[10]
			)
		} else {
			return (
				cloudinary_mobile
				+ `,x_${new_gravity}/`
				+ `${image_slide[8]}/`
				+ `${image_slide[9]}/`
				+ image_slide[10]
			)
		}
		
	}

}(window.jQuery, window, document));
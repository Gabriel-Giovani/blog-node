function previewImage(){

    let image = document.querySelector('#image').files[0];
    let preview = document.querySelector('#preview-img')
    let reader = new FileReader();

    reader.onloadend = () => {

        preview.src = reader.result;

    }

    if(image){

        reader.readAsDataURL(image);

    } else{

        preview.src = "";

    }

}
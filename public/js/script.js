function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status == "add") {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        Swal.fire({
          icon: "success",
          title: "Item added to Cart",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if (response.status == "noStock") {
        Swal.fire({
          icon: "error",
          title: "Oops..!",
          text: "Out Of Stock!",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if (response.status == "fewStock"){
        Swal.fire({
          icon: "error",
          title: "Oops..!",
          text: "Out Of Stock!",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if(response.status == "maxLimitStock") {
        Swal.fire({
          icon: "warning",
          title: "Oops..!",
          text: "Limit Is Reached!",
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        location.href = "/login";
      }
    },
  });
}
// function addToCart(proId){
//     $.ajax({
//         url:'/add-to-cart/'+proId,
//         method:'get',
//         success:(response)=>{
//             if(response.status){
//                 let count=$('#cart-count').html()
//                 count=parseInt(count)+1
//                 $('#cart-count').html(count)
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Item added to Cart',
//                     showConfirmButton: false,
//                     timer: 1000
//                 })
//             }
//         }
//     })
// }

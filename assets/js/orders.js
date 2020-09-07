// {
//     let createOrder = function () { 
//         let newOrder = $('#orders');
//         newOrder.submit(function (e) {
//             e.preventDefault();
//             $.ajax({
//                 type: 'get',
//                 url: "/orders",
//                 data: newOrder.serialize(),
//                 success: function (data) {
//                     console.log(data);
//                     let newData = currOrder(data.data.keys.keyNumber);
//                   },error: function (error) {
//                       console.log(error.responseText)
//                     }
//             })
//           })
//      }

//     let currOrder = $(`
//     <div class="assign text-center" id="orders">
//         <p style="text-transform: uppercase; font-size: 1.8rem;">Your Key is: &nbsp; ${user.purchaseHistory}</p> 
//     </div>
//     `)


//      createOrder();
// }
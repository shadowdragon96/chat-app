const socket=io ()
//elements
const $sendmsg=document.querySelector('#sendmsg')
const $button =$sendmsg.querySelector('button')
const $input =$sendmsg.querySelector('input')
const $locationbutton =document.querySelector('#sendlocation')
const $messages =document.querySelector('#messages')

//templates

const messagetempelate = document.querySelector('#message-template').innerHTML
const locationtempelate = document.querySelector('#location-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML
//options
const{username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on('message',(msg)=>{
    //  
const html =Mustache.render(messagetempelate,{message:msg.text,createdat: moment(msg.createdat) .format('h:mm: a'),username:username})
$messages.insertAdjacentHTML('beforeend',html)

})
socket.on('location-message',(loc)=>{
   // console.log(loc)
   const html= Mustache.render(locationtempelate,{loc:loc.url,createdat:moment(loc.createdat).format('h:mm a'),username:username})
   $messages.insertAdjacentHTML('beforeend',html)
   
})


 $sendmsg.addEventListener('submit',(e)=>{
    e.preventDefault()
    $button.setAttribute('disabled','disabled')
    const message =e.target.elements.message.value
  
    socket.emit('sendmsg',message,(error)=>{
        $button.removeAttribute('disabled')
        $input.value=''
        $input.focus()
        if(error)
        return console.log(error)
        console.log('delivered')
    })
})


$locationbutton.addEventListener('click',()=>{
   
    if(!navigator.geolocation)
    return alert(`ur browser is shit`)
    $locationbutton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
// console.log(position)
  socket.emit('myloc',{latitude: position.coords.latitude, longitude: position.coords.longitude},()=>{
    $locationbutton.removeAttribute('disabled')
      console.log('loc delivered')
  })
    })

    
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert('duplicate username')
        location.href='/'

    }
    
})
socket.on('roomdata',({room,users})=>{
    const html = Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html

})
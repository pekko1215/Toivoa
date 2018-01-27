window.addEventListener('load', () => {
    (function() {
        var timer;
        var resized;
        var min = 160;
        var max = 400;
        document.getElementById('list-button').addEventListener('click', () => {
			if(timer){return}
			if(!resized){
				timer = setInterval(()=>{
					if(window.outerHeight < max){
						window.resizeBy(0,10);
					}else{
						clearInterval(timer);
						timer = null;
						resized = true
					}
				},10)
			}else{
				timer = setInterval(()=>{
					if(window.outerHeight > min){
						window.resizeBy(0,-10);
					}else{
						clearInterval(timer);
						timer = null;
						resized = false
					}
				},10)
			}
		})
    })()
})
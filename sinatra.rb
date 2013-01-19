require 'sinatra'
require 'rubygems'
require 'hmac-sha2'

get '/sfuej' do
  if !(params[:video_url] && params[:session_id])
    [404, '404: Invalid url']
  else
    if params[:video_url]['youtube.com']
      type = 'yt'
    else
      type = 'vidlink'
    end
    video_url = params[:video_url]
    video_id = video_url.split('=', 2)[1]
    erb :video, :locals => {
      :video_id => video_id,
      :session_id => params[:session_id],
      :type => type
    }
  end
end

get '/' do
  erb :index
end

# TODO(donaldh) for shortener if we get to it
#get %r{/(?<shortened>.*/?)} do
#  params['captures'][0]
#end

post '/pusher/auth' do
  key = '86baf974dd9fd950a9c8'
  secret = 'e3fcaaf58db221657bf4'
  string_to_sign = "#{params[:socket_id]}:#{params[:channel_name]}"

  signature = HMAC::SHA256.hexdigest(secret, string_to_sign)
  "{\"auth\":\"#{key}:#{signature}\"}"
end
